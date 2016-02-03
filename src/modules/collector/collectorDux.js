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
import DataPoint from 'dataPoint.js';
import Metric from 'metric.js';
import * as Calc from 'calc.js';


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
  interfaceUtilizationMetrics: [],
  ports: {},
  powerSupplies: {},
  powerSuppliesRollup: {},
  fans: {},
  fansRollup: {},
  temps: {},
  tempsRollup: {},
};

// Stores { txMetric, rxMetric, txRxMetric, prevData } for each entity.
const interfaceCache = {};

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

function getOrCreateCachedInterface(data) {
  const id = data.id;
  let cachedInterface = interfaceCache[id];

  if (cachedInterface) {
    // we have a cached interface make sure it is still valid
    if (cachedInterface.duplex !== data.duplex ||
        cachedInterface.speed !== data.speed) {
      cachedInterface = null;
    }
  }

  if (!cachedInterface) {
    if (data.duplex === 'half') {
      const txRxMetric = new Metric()
        .setName(`${id} TxRx`)
        .setUnits('%')
        .setColorIndex('graph-3');
      cachedInterface = { txRxMetric };
    } else {
      const txMetric = new Metric()
        .setName(`${id} Tx`)
        .setUnits('%')
        .setColorIndex('graph-3');
      const rxMetric = new Metric()
        .setName(`${id} Rx`)
        .setUnits('%')
        .setColorIndex('graph-3');
      cachedInterface = { txMetric, rxMetric };
    }

    interfaceCache[id] = cachedInterface;
  }

  return cachedInterface;
}

function processInterfaceMetric(metric, now, pTs, pBytes, cBytes, spd) {
  const interval = now - pTs;
  if (interval > 0) {
    const rawUtl = Calc.utilization(pBytes, cBytes, spd, interval);
    const utl = Math.round(rawUtl);
    metric.addDataPoint(new DataPoint(utl, now));
    return metric;
  }
  return null;
}

function processInterfaceUtilization(data, modifiedMetrics) {
  const cachedInterface = getOrCreateCachedInterface(data);
  const cd = data;            // current data
  const pd = cachedInterface; // previous data
  const ts = Date.now();
  if (cd.linkState === 'up') {
    if (cd.duplex === 'half') {
      const metric = cachedInterface.txRxMetric;
      const pBytes = pd.rxBytes + pd.txBytes;
      const cBytes = cd.rxBytes + cd.txBytes;
      if (processInterfaceMetric(metric, ts, pd.ts, pBytes, cBytes, cd.speed)) {
        modifiedMetrics.push(metric);
      }
    } else {
      let metric = cachedInterface.txMetric;
      let pBytes = pd.txBytes;
      let cBytes = cd.txBytes;
      if (processInterfaceMetric(metric, ts, pd.ts, pBytes, cBytes, cd.speed)) {
        modifiedMetrics.push(metric);
      }
      metric = cachedInterface.rxMetric;
      pBytes = pd.rxBytes;
      cBytes = cd.rxBytes;
      if (processInterfaceMetric(metric, ts, pd.ts, pBytes, cBytes, cd.speed)) {
        modifiedMetrics.push(metric);
      }
    }
  }
  // Save the current data (which will be prevData next time).
  cachedInterface.rxBytes = data.rxBytes;
  cachedInterface.txBytes = data.txBytes;
  cachedInterface.speed = data.speed;
  cachedInterface.duplex = data.duplex;
  cachedInterface.ts = ts;
}

function parseResult(result) {
  const ssBaseBody = result[0].body;
  const sysBody = result[1].body;
  const infBody = result[2].body;
  const portBody = result[3].body;
  const pwrBody = result[4].body;
  const fanBody = result[5].body;
  const tempBody = result[6].body;

  const oi = ssBaseBody.status.other_info;
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
    maxInterfaceSpeed: oi.max_interface_speed,
    mtu: oi.max_transmission_unit,
    interfaceCount: oi.interface_count,
  };

  const interfaceUtilizationMetrics = [];
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
      processInterfaceUtilization(data, interfaceUtilizationMetrics);
      interfaces[id] = data;
    }
  });

  interfaceUtilizationMetrics.sort((m1, m2) => {
    return m2.latestDataPoint().value() - m1.latestDataPoint().value();
  });

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
    interfaceUtilizationMetrics,
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
