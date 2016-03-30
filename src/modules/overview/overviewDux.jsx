/*
 (C) Copyright 2015 Hewlett Packard Enterprise Development LP

    Licensed under the Apache License, Version 2.0 (the "License"); you may
    not use this file except in compliance with the License. You may obtain
    a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
    License for the specific language governing permissions and limitations
    under the License.
*/

import Async from 'async';
import OverviewPage from './overviewPage.jsx';
import AsyncDux from 'asyncDux.js';
import Agent from 'agent.js';
import Formatter from 'formatter.js';


const NAME = 'overview';

const NAVS = [
  {
    route: { path: '/overview', component: OverviewPage },
    link: { path: '/overview', order: 100 }
  },
];

const INITIAL_STORE = {
  info: {},
  powerSupplies: {},
  powerSuppliesRollup: { status: 'unknown' },
  fans: {},
  fansRollup: { status: 'unknown' },
  temps: {},
  tempsRollup: { status: 'unknown' },
  lldp: {},
  ecmp: {},
};

const AD = new AsyncDux(NAME, INITIAL_STORE);

function parseTempStatus(id, s) {
  const max = Number(s.max) / 1000;
  const min = Number(s.min) / 1000;
  const value = Number(s.temperature) / 1000;
  const status = value < max ? 'ok' : 'warning';
  return {
    id,
    location: s.location,
    max,
    min,
    value,
    status,
  };
}

function parseEcmp(ecmpCfg) {
  function norm(key) {
    return ecmpCfg && ecmpCfg[key] === 'false' ? 'disabled' : 'enabled';
  }
  return {
    enabled: norm('enabled'),
    hashDstIp: norm('hash_dstip_enabled'),
    hashDstPort: norm('hash_dstport_enabled'),
    hashSrcIp: norm('hash_srcip_enabled'),
    hashSrcPort: norm('hash_srcport_enabled'),
    resilientHash: norm('resilient_hash_enabled'),
  };
}

function parsePowerStatus(s) {
  if (s === 'ok') {
    return { text: 'ok', status: 'ok' };
  } else if (s === 'fault_input') {
    return { text: 'powerFaultInput', status: 'warning' };
  } else if (s === 'fault_output') {
    return { text: 'powerFaultOutput', status: 'critical' };
  }
  return { text: 'powerAbsent', status: 'warning' };
}

function parseFanStatus(s) {
  if (s === 'ok') {
    return { text: 'ok', status: 'ok' };
  } else if (s === 'fault') {
    return { text: 'fanFault', status: 'critical' };
  }
  return { text: 'fanUninitialized', status: 'warning' };
}

function updateRollup(status, rollup) {
  if (status === 'critical') {
    rollup.critical = rollup.critical + 1;
  } else if (status === 'warning') {
    rollup.warning = rollup.warning + 1;
  } else if (status === 'ok') {
    rollup.ok = rollup.ok + 1;
  }
}

function rollupStatus(rollup) {
  return rollup.critical ? 'critical'
    : rollup.warning ? 'warning'
    : rollup.ok ? 'ok'
    : 'unknown';
}

const parser = (result) => {
  const ssBaseBody = result[0].body;
  const sysBody = result[1].body;
  const pwrBody = result[2].body;
  const fanBody = result[3].body;
  const tempBody = result[4].body;
  const vlansBody = result[5].body;

  const oi = ssBaseBody.status.other_info;

  // Info
  const maxInterfaceSpeed = Formatter.mbpsToString(oi.max_interface_speed);
  const baseMac = oi.base_mac_address && oi.base_mac_address.toUpperCase();

  const info = {
    hostname: sysBody.configuration.hostname,
    version: sysBody.status.switch_version,
    product: oi['Product Name'],
    partNum: oi.part_number,
    onieVersion: oi.onie_version,
    baseMac,
    serialNum: oi.serial_number,
    vendor: oi.vendor,
    maxInterfaceSpeed,
    mtu: oi.max_transmission_unit,
    interfaceCount: oi.interface_count,
    numVlans: vlansBody.length,
  };

  // Power Supplies
  const powerSupplies = {};
  let rollup = { critical: 0, warning: 0, ok: 0 };
  pwrBody.forEach((elm) => {
    const id = elm.status.name;
    const ps = parsePowerStatus(elm.status.status);
    powerSupplies[id] = { id, ...ps };
    updateRollup(ps.status, rollup);
  });
  let status = rollupStatus(rollup);
  const powerSuppliesRollup = { status };

  // Fans
  const fans = {};
  rollup = { critical: 0, warning: 0, ok: 0 };
  fanBody.forEach((elm) => {
    const id = elm.status.name;
    const ps = parseFanStatus(elm.status.status);
    const cfg = elm.configuration;
    fans[id] = {
      id,
      ...ps,
      dir: cfg.direction,
      speed: cfg.speed,
      rpm: Formatter.toCommaString(elm.status.rpm),
    };
    updateRollup(ps.status, rollup);
  });
  status = rollupStatus(rollup);
  const fansRollup = { status };

  // Temperatures
  const temps = {};
  rollup = { critical: 0, warning: 0, ok: 0 };
  tempBody.forEach((elm) => {
    const id = elm.status.name;
    const normTemp = parseTempStatus(id, elm.status);
    updateRollup(normTemp.status, rollup);
    temps[id] = normTemp;
  });
  status = rollupStatus(rollup);
  const tempsRollup = { status };

  // LLDP
  const sysOc = sysBody.configuration.other_config;
  const lldp = {
    enabled: (sysOc && sysOc.lldp_enable) ? 'enabled' : 'disabled'
  };

  // ECMP
  const ecmp = parseEcmp(sysBody.configuration.ecmp_config);

  return {
    info,
    powerSupplies,
    powerSuppliesRollup,
    fans,
    fansRollup,
    temps,
    tempsRollup,
    lldp,
    ecmp,
  };
};

const URL_BASE = '/rest/v1/system/subsystems/base';
const URL_SYS = '/rest/v1/system';
const URL_PWR = '/rest/v1/system/subsystems/base/power_supplies?depth=1';
const URL_FAN = '/rest/v1/system/subsystems/base/fans?depth=1';
const URL_TEMP = '/rest/v1/system/subsystems/base/temp_sensors?depth=1';
const URL_VLANS = '/rest/v1/system/bridges/bridge_normal/vlans';

const ACTIONS = {

  fetch() {
    return (dispatch) => {
      dispatch(AD.action('REQUEST'));
      Async.parallel([
        cb => Agent.get(URL_BASE).end(cb),
        cb => Agent.get(URL_SYS).end(cb),
        cb => Agent.get(URL_PWR).end(cb),
        cb => Agent.get(URL_FAN).end(cb),
        cb => Agent.get(URL_TEMP).end(cb),
        cb => Agent.get(URL_VLANS).end(cb),
      ], (error, result) => {
        if (error) { return dispatch(AD.action('FAILURE', { error })); }
        return dispatch(AD.action('SUCCESS', { result, parser } ));
      });
    };
  }

};

export default {
  NAME,
  NAVS,
  ACTIONS,
  REDUCER: AD.reducer(),
};
