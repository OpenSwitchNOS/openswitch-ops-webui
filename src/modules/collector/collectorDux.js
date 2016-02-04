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

const NAME = 'collector';

const URLS = [
  '/rest/v1/system/subsystems/base',
  '/rest/v1/system',
  '/rest/v1/system/interfaces?depth=1',
  '/rest/v1/system/ports?depth=1',
  '/rest/v1/system/subsystems/base/power_supplies?depth=1',
  '/rest/v1/system/subsystems/base/fans?depth=1',
  '/rest/v1/system/subsystems/base/temp_sensors?depth=1',
];

const AUTO_ACTIONS = {
  fetch() { return Dux.fetchAction(NAME, URLS); }
};

const INITIAL_STORE = {
  info: {},
  interfaces: {},
  interfaceMetrics: {},
  interfaceTopMetrics: [],
  ports: {},
  powerSupplies: {},
  powerSuppliesRollup: { status: 'unknown' },
  fans: {},
  fansRollup: { status: 'unknown' },
  temps: {},
  tempsRollup: { status: 'unknown' },
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

function parseResult(result) {
  const now = Date.now();

  const ssBaseBody = result[0].body;
  const sysBody = result[1].body;
  const infBody = result[2].body;
  const portBody = result[3].body;
  const pwrBody = result[4].body;
  const fanBody = result[5].body;
  const tempBody = result[6].body;

  const oi = ssBaseBody.status.other_info;
  const baseMac = oi.base_mac_address && oi.base_mac_address.toUpperCase();
  const sysOc = sysBody.configuration.other_config;
  const info = {
    hostname: sysBody.configuration.hostname,
    version: sysBody.status.switch_version,
    product: oi['Product Name'],
    partNum: oi.part_number,
    onieVersion: oi.onie_version,
    baseMac,
    serialNum: oi.serial_number,
    vendor: oi.vendor,
    maxInterfaceSpeed: oi.max_interface_speed,
    mtu: oi.max_transmission_unit,
    interfaceCount: oi.interface_count,
    lldp: sysOc.lldp_enable === 'true' ? 'enabled' : 'disabled',
  };

  const interfaces = {};
  infBody.forEach((elm) => {
    const cfg = elm.configuration;
    if (cfg.type === 'system') {
      const id = cfg.name;
      const stats = elm.statistics.statistics;
      const data = {
        id,
        adminState: elm.status.admin_state,
        linkState: elm.status.link_state,
        duplex: elm.status.duplex,
        speed: elm.status.link_speed,
        connector: elm.status.pm_info.connector,
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

  const metrics = interfaceCache.metrics(now);
  const interfaceMetrics = metrics.all;
  const interfaceTopMetrics = metrics.top;

  const ports = {};
  portBody.forEach((elm) => {
    const id = elm.configuration.name;
    ports[id] = {
      id
    };
  });

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

  return {
    info,
    interfaces,
    interfaceMetrics,
    interfaceTopMetrics,
    ports,
    powerSupplies,
    powerSuppliesRollup,
    fans,
    fansRollup,
    temps,
    tempsRollup,
  };
}

const REDUCER = Dux.fetchReducer(NAME, INITIAL_STORE, parseResult);

export default {
  NAME,
  AUTO_ACTIONS,
  REDUCER,
};