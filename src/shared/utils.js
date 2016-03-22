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

import Formatter from 'formatter.js';


const DEF_USER_CFG = {
  autoNeg: 'on',
  duplex: 'full',
  admin: 'down',
  flowCtrl: 'none',
};

function normalizeUserCfg(userCfg) {
  return {
    admin: (userCfg && userCfg.admin) || DEF_USER_CFG.admin,
    duplex: (userCfg && userCfg.duplex) || DEF_USER_CFG.duplex,
    autoNeg: (userCfg && userCfg.autoneg) || DEF_USER_CFG.autoNeg,
    flowCtrl: (userCfg && userCfg.pause) || DEF_USER_CFG.flowCtrl,
  };
}

function userCfgForPatch(userCfg) {
  const minUserCfg = { ...userCfg };
  Object.getOwnPropertyNames(DEF_USER_CFG).forEach(k => {
    if (DEF_USER_CFG[k] === minUserCfg[k]) {
      delete minUserCfg[k];
    }
  });
  // TODO: revisit this for a better way
  const patchUserCfg = {};
  if (minUserCfg.admin) { patchUserCfg.admin = minUserCfg.admin; }
  if (minUserCfg.duplex) { patchUserCfg.duplex = minUserCfg.duplex; }
  if (minUserCfg.autoNeg) { patchUserCfg.autoneg = minUserCfg.autoNeg; }
  if (minUserCfg.flowCtrl) { patchUserCfg.pause = minUserCfg.flowCtrl; }
  return patchUserCfg;
}

function parseInterface(inf) {
  const cfg = inf.configuration;
  const status = inf.status;
  const stats = inf.statistics.statistics;
  const userCfg = normalizeUserCfg(cfg.user_config);
  const userCfgAdmin = userCfg.admin;
  const userCfgDuplex = userCfg.duplex;
  const userCfgAutoNeg = userCfg.autoNeg;
  const userCfgFlowCtrl = userCfg.flowCtrl;

  const adminState = status.admin_state;

  let tmp = status.pm_info;
  const connector = (tmp && tmp.connector) || 'absent';

  tmp = status.hw_intf_info;
  const mac = (tmp && tmp.mac_addr) ? tmp.mac_addr.toUpperCase() : '';

  const adminStateConnector =
    adminState !== 'up' && userCfgAdmin === 'up' && connector === 'absent'
    ? 'downAbsent' : adminState;

  let speed = '';
  let speedFormatted = '';
  let duplex = '';
  if (adminState === 'up') {
    speed = status.link_speed ? Number(status.link_speed) : 0;
    speedFormatted = Formatter.bpsToString(speed);
    duplex = status.duplex;
  }

  return {
    id: cfg.name,
    userCfg,
    userCfgAdmin,
    userCfgDuplex,
    userCfgAutoNeg,
    userCfgFlowCtrl,
    connector,
    adminState,
    adminStateConnector,
    mac,
    speed,
    speedFormatted,
    duplex,

    linkState: status.link_state,
    mtu: status.mtu,

    rxBytes: Number(stats.rx_bytes) || 0,
    txBytes: Number(stats.tx_bytes) || 0,
    rxPackets: Number(stats.rx_packets) || 0,
    txPackets: Number(stats.tx_packets) || 0,
    rxErrors: Number(stats.rx_errors) || 0,
    txErrors: Number(stats.tx_errors) || 0,
    rxDropped: Number(stats.rx_dropped) || 0,
    txDropped: Number(stats.tx_dropped) || 0,
  };
}


// TODO: mock log data
let mockLogDataNextId = 0;
const mockLogData = {};

function parseLogOverview() {

  function rnd(n) {
    return Math.floor((Math.random() * n) + 1);
  }

  function nextId() {
    mockLogDataNextId++;
    if (mockLogDataNextId > 20) { mockLogDataNextId = 1; }
    return mockLogDataNextId;
  }

  function warn() {
    return {
      id: nextId(),
      ts: Date.now(),
      sev: 'warning',
      msg: `High utilization (${rnd(15)+80}%) on interface ${rnd(45)}`,
    };
  }

  function crit() {
    return {
      id: nextId(),
      ts: Date.now(),
      sev: 'critical',
      msg: `High temperature (${rnd(5)+30} C) detected on base-${rnd(3)}`,
    };
  }

  function info() {
    return {
      id: nextId(),
      ts: Date.now(),
      sev: 'ok',
      msg: `User 'jpowell' authenticated from from 10.0.0.${rnd(255)}`,
    };
  }

  const numAdded = 1;
  for (let i=0; i<numAdded; i++) {
    const type = rnd(3);
    const log = (type === 1) ? warn() : (type === 2) ? crit() : info();
    mockLogData[log.id] = log;
  }

  let startTs = Date.now();
  let endTs = 0;
  Object.getOwnPropertyNames(mockLogData).forEach(k => {
    const entry = mockLogData[k];
    if (startTs > entry.ts) { startTs = entry.ts; }
    if (endTs < entry.ts) { endTs = entry.ts; }
  });

  const entries = {};
  Object.assign(entries, mockLogData);

  return {
    startTs,
    endTs,
    numAdded,
    entries,
  };
}

// TODO: need unit test

const NUMBER_GROUPS = /(-?\d*\.?\d+)/g;

function naturalSort(a, b) {
  const aa = String(a).split(NUMBER_GROUPS);
  const bb = String(b).split(NUMBER_GROUPS);
  const min = Math.min(aa.length, bb.length);

  for (let i = 0; i < min; i++) {
    const x = parseFloat(aa[i]) || aa[i].toLowerCase();
    const y = parseFloat(bb[i]) || bb[i].toLowerCase();
    if (x < y) {
      return -1;
    } else if (x > y) {
      return 1;
    }
  }
  return 0;
}

// TODO: need unit test

export function txlate(val, mapping, notFoundVal) {
  const mapVal = mapping[val];
  return mapVal || notFoundVal || 'unknown';
}

// TODO: use 'non-export' default way to export

export default {
  DEF_USER_CFG,
  txlate,
  normalizeUserCfg,
  userCfgForPatch,
  parseInterface,
  parseLogOverview,
  naturalSort,
};
