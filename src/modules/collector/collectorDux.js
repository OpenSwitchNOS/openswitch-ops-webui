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

import Dux from 'dux.js';
import InterfaceCache from './interfaceCache.js';
import { TX, RX, TX_RX } from './interfaceData.js';
import * as Formatter from 'formatter.js';

const NAME = 'collector';

const OVERVIEW_ASYNC = 'overview';
const OVERVIEW_AT = Dux.mkAsyncActionTypes(NAME, OVERVIEW_ASYNC);

const URLS = [
  '/rest/v1/system/subsystems/base',
  '/rest/v1/system',
  '/rest/v1/system/interfaces?depth=1',
  '/rest/v1/system/subsystems/base/power_supplies?depth=1',
  '/rest/v1/system/subsystems/base/fans?depth=1',
  '/rest/v1/system/subsystems/base/temp_sensors?depth=1',
];

const AUTO_ACTIONS = {
  fetch() {
    return (dispatch, getStoreFn) => {
      const mStore = getStoreFn()[NAME];
      Dux.getIfCooledDown(dispatch, mStore, OVERVIEW_ASYNC, OVERVIEW_AT, URLS);
    };
  },
};

const ACTIONS = {
  fetchImmediate() {
    return (dispatch) => {
      Dux.get(dispatch, OVERVIEW_AT, URLS);
    };
  },
};

const interfaceCache = new InterfaceCache();

function normalizePowerStatus(s) {
  if (s === 'ok') {
    return { text: 'ok', status: 'ok' };
  } else if (s === 'fault_input') {
    return { text: 'powerFaultInput', status: 'warning' };
  } else if (s === 'fault_output') {
    return { text: 'powerFaultOutput', status: 'critical' };
  }
  return { text: 'powerAbsent', status: 'warning' };
}

function normalizeFanStatus(s) {
  if (s === 'ok') {
    return { text: 'ok', status: 'ok' };
  } else if (s === 'fault') {
    return { text: 'fanFault', status: 'critical' };
  }
  return { text: 'fanUninitialized', status: 'warning' };
}

function normalizeTempStatus(id, s) {
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

function parseInterfaces(infBody, now) {
  const interfaces = {};
  infBody.forEach((elm) => {
    const cfg = elm.configuration;
    if (cfg.type === 'system') {
      const id = cfg.name;
      const stats = elm.statistics.statistics;
      const adminState = elm.status.admin_state;
      const hwIntfInfo = elm.status.hw_intf_info;
      const connector = hwIntfInfo ? hwIntfInfo.connector : 'absent';
      const mac = hwIntfInfo ? hwIntfInfo.mac_addr.toUpperCase() : '';
      const adminStateConnector = adminState === 'up' ? 'up'
          : connector === 'absent' ? 'downAbsent' : 'down';
      const speed = elm.status.link_speed ? Number(elm.status.link_speed) : 0;
      const data = {
        id,
        adminUserUp: cfg.user_config && cfg.user_config.admin === 'up',
        adminState,
        adminStateConnector,
        duplex: elm.status.duplex,
        linkState: elm.status.link_state,
        speed,
        speedFormatted: Formatter.bpsToString(speed),
        connector,
        mac,
        rxBytes: Number(stats.rx_bytes),
        txBytes: Number(stats.tx_bytes)
      };
      if (data.linkState === 'up') {
        const interfaceData = interfaceCache.getOrCreateInterface(
          id, data.speed, data.duplex
        );
        if (data.duplex === 'half') {
          interfaceData.updateMetric(TX_RX, data.rxBytes + data.txBytes, now);
        } else if (data.duplex === 'full') {
          interfaceData.updateMetric(TX, data.txBytes, now);
          interfaceData.updateMetric(RX, data.rxBytes, now);
        }
      }
      interfaces[id] = data;
    }
  });
  return interfaces;
}

function parseOverviewResult(result) {

  // Define some useful constants...

  const now = Date.now();
  const ssBaseBody = result[0].body;
  const sysBody = result[1].body;
  const infBody = result[2].body;
  const pwrBody = result[3].body;
  const fanBody = result[4].body;
  const tempBody = result[5].body;

  const oi = ssBaseBody.status.other_info;
  const sysOc = sysBody.configuration.other_config;

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
  };

  // Interfaces

  const interfaces = parseInterfaces(infBody, now);

  const metrics = interfaceCache.metrics(now);
  const interfaceMetrics = metrics.all;
  const interfaceTopMetrics = metrics.top;

  // Power Supplies

  const powerSupplies = {};
  let critical = 0;
  let warning = 0;
  let ok = 0;
  pwrBody.forEach((elm) => {
    const id = elm.status.name;
    const ps = normalizePowerStatus(elm.status.status);
    powerSupplies[id] = {
      id,
      text: ps.text,
      status: ps.status,
    };
    if (ps.status === 'critical') {
      critical++;
    } else if (ps.status === 'warning') {
      warning++;
    } else if (ps.status === 'ok') {
      ok++;
    }
  });
  let status = critical ? 'critical' :
    warning ? 'warning' :
      ok ? 'ok' : 'unknown';
  const powerSuppliesRollup = { status, critical, warning, ok };

  // Fans

  const fans = {};
  critical = 0;
  warning = 0;
  ok = 0;
  fanBody.forEach((elm) => {
    const id = elm.status.name;
    const ps = normalizeFanStatus(elm.status.status);
    fans[id] = {
      id,
      text: ps.text,
      status: ps.status,
    };
    if (ps.status === 'critical') {
      critical++;
    } else if (ps.status === 'warning') {
      warning++;
    } else if (ps.status === 'ok') {
      ok++;
    }
  });
  status = critical ? 'critical' :
    warning ? 'warning' :
      ok ? 'ok' : 'unknown';
  const fansRollup = { status, critical, warning, ok };

  // Temperatures

  const temps = {};
  critical = 0;
  warning = 0;
  ok = 0;
  tempBody.forEach((elm) => {
    const id = elm.status.name;
    const normTemp = normalizeTempStatus(id, elm.status);
    if (normTemp.status === 'critical') {
      critical++;
    } else if (normTemp.status === 'warning') {
      warning++;
    } else if (normTemp.status === 'ok') {
      ok++;
    }
    temps[id] = normTemp;
  });
  status = critical ? 'critical' :
    warning ? 'warning' :
      ok ? 'ok' : 'unknown';
  const tempsRollup = { status, critical, warning, ok };

  // LLDP

  const lldp = {
    enabled: sysOc && sysOc.lldp_enable === 'true',
  };

  // ECMP

  const ecmpCfg = sysBody.configuration.ecmp_config;
  const ecmp = {
    enabled: ecmpCfg && ecmpCfg.enabled === 'true',
    hashDstIp: ecmpCfg && ecmpCfg.hash_dstip_enabled === 'true',
    hashDstPort: ecmpCfg && ecmpCfg.hash_dstport_enabled === 'true',
    hashSrcIp: ecmpCfg && ecmpCfg.hash_srcip_enabled === 'true',
    hashSrcPort: ecmpCfg && ecmpCfg.hash_srcport_enabled === 'true',
    resilientHash: ecmpCfg && ecmpCfg.resilient_hash_enabled === 'true',
  };

  return {
    info,
    interfaces,
    interfaceMetrics,
    interfaceTopMetrics,
    powerSupplies,
    powerSuppliesRollup,
    fans,
    fansRollup,
    temps,
    tempsRollup,
    lldp,
    ecmp,
  };
}

const INITIAL_STORE = {
  overview: {
    ...Dux.mkAsyncStore(),
    info: {},
    interfaces: {},
    interfaceMetrics: {},
    interfaceTopMetrics: [],
    powerSupplies: {},
    powerSuppliesRollup: { status: 'unknown' },
    fans: {},
    fansRollup: { status: 'unknown' },
    temps: {},
    tempsRollup: { status: 'unknown' },
    lldp: {},
    ecmp: {},
  }
};

const REDUCER = Dux.mkReducer(INITIAL_STORE, [
  Dux.mkAsyncHandler(NAME, OVERVIEW_ASYNC, OVERVIEW_AT, parseOverviewResult),
]);

export default {
  NAME,
  AUTO_ACTIONS,
  ACTIONS,
  REDUCER,
};
