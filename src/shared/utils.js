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
  flowCtrl: 'off',
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
  const patchUserCfg = { ...userCfg };
  Object.getOwnPropertyNames(DEF_USER_CFG).forEach(k => {
    if (DEF_USER_CFG[k] === patchUserCfg[k]) {
      delete patchUserCfg[k];
    }
  });
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

  const adminStateConnector = (adminState !== 'up' && connector === 'absent')
    ? 'downAbsent' : adminState;

  const speed = status.link_speed ? Number(status.link_speed) : 0;

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
    speedFormatted: Formatter.bpsToString(speed),

    linkState: status.link_state,
    duplex: status.duplex,
    mtu: status.mtu,

    rxBytes: Number(stats.rx_bytes),
    txBytes: Number(stats.tx_bytes),
    rxPackets: Number(stats.rx_packets),
    txPackets: Number(stats.tx_packets),
    rxErrors: Number(stats.rx_errors),
    txErrors: Number(stats.tx_errors),
    rxDropped: Number(stats.rx_dropped),
    txDropped: Number(stats.tx_dropped),
  };
}

function parseInterfaceResp(resp) {
  const inf = parseInterface(resp.body);
  inf.etag = resp.headers.etag;
  return inf;
}

export default {
  DEF_USER_CFG,
  normalizeUserCfg,
  userCfgForPatch,
  parseInterface,
  parseInterfaceResp,
};
