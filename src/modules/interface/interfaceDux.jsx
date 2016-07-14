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

import { t } from 'i18n/lookup.js';
import AsyncDux from 'asyncDux.js';
import Agent from 'agent.js';
import Async from 'async';
import * as C from './interfaceConst.js';
import InterfacePage from './interfacePage.jsx';
import InterfaceDetails from './interfaceDetails.jsx';
import Formatter from 'formatter.js';


const NAME = 'interface';

export const NAVS = [
  {
    route: { path: '/interface', component: InterfacePage },
    link: { path: '/interface', order: 200 }
  },
  {
    route: {path: '/interface/:id', component: InterfaceDetails},
    link: {path: '/interface', hidden: true}
  }
];

const INITIAL_STORE = {
  interfaces: {},
  interface: {
    lldp: {},
    lag: {},
  },
  port: {},
  edit: {
    interface: { [C.USER_CFG]: {} },
    port: {},
  }
};

const AD = new AsyncDux(NAME, INITIAL_STORE);

function parseLldp(inf) {
  const ni = inf.status.lldp_neighbor_info;
  const ls = inf.statistics.lldp_statistics;
  return {
    chassisName: (ni && ni.chassis_name) || '',
    chassisId: (ni && ni.chassis_id) || '',
    ip: (ni && ni.mgmt_ip_list) || '',
    portId: (ni && ni.port_id) || '',
    sysDesc: (ni && ni.chassis_description) || '',
    capsSupported: (ni && ni.chassis_capability_available) || '',
    capsEnabled: (ni && ni.chassis_capability_enabled) || '',

    framesTx: (ls && ls.lldp_tx) || 0,
    framesRx: (ls && ls.lldp_rx) || 0,
    framesRxDiscarded: (ls && ls.lldp_rx_discard) || 0,
    framesRxUnrecog: (ls && ls.lldp_rx_unrecognized) || 0,
  };
}

function parseLag(inf) {
  const lacpStatus = inf.status.lacp_status;
  if (lacpStatus) {
    return {
      actorKey: lacpStatus.actor_key,
      actorSystemId: lacpStatus.actor_system_id,
      actorPortId: lacpStatus.actor_port_id,
      actorState: lacpStatus.actor_state,

      partnerKey: lacpStatus.partner_key,
      partnerSystemId: lacpStatus.partner_system_id,
      partnerPortId: lacpStatus.partner_port_id,
      partnerState: lacpStatus.partner_state
    };
  }
  return {};
}

function formatUrl(arr) {
  const result = arr.map(i => i.split('/').pop());
  return result;
}

function parseInterface(inf) {
  const cfg = inf.configuration;
  const status = inf.status;

  const uc = cfg.user_config;
  const cfgAdmin = (uc && uc[C.ADMIN]) || C.ADMIN_DEF;
  const cfgDuplex = (uc && uc[C.DUPLEX]) || C.DUPLEX_DEF;
  const cfgAutoNeg = (uc && uc[C.AUTO_NEG]) || C.AUTO_NEG_DEF;
  const cfgFlowCtrl = (uc && uc[C.FLOW_CTRL]) || C.FLOW_CTRL_DEF;
  const cfgLaneSplit = (uc && uc[C.LANE_SPLIT]) || C.LANE_SPLIT_DEF;

  const adminState = status.admin_state;
  const linkState = status.link_state;

  const speed = linkState !== 'up' ? null : status.link_speed || 0;
  const speedFormatted = Formatter.bpsToString(status.link_speed) || '';

  const duplex = linkState !== 'up' ? null : status.duplex;

  const pm = status.pm_info;
  let connector = (pm && pm.connector) || 'absent';

  const hw = status.hw_intf_info;
  const mac = (hw && hw.mac_addr) ? hw.mac_addr.toUpperCase() : '';

  const mtu = status.mtu || '';

  const adminStateConnector = adminState !== 'up' &&
    cfgAdmin === 'up' && connector === 'absent' ? 'downAbsent' : adminState;

  const lacpStatus = parseLag(inf);

  const canSplit = (hw && hw.split_4) ? hw.split_4 : '';

  let splitParent = '';
  let splitChildren = [];
  if (status.split_children) {
    splitChildren = formatUrl(status.split_children);
  }
  if (status.split_parent) {
    splitParent = formatUrl(status.split_parent);
    connector = '';
  }

  return {
    id: status.name,
    cfgAdmin,
    cfgDuplex,
    cfgAutoNeg,
    cfgFlowCtrl,
    cfgLaneSplit, //is split if cfglaneSplit is split
    connector,
    adminState, // needed by the boxGraphic
    adminStateConnector,
    mac,
    mtu,
    speed,
    speedFormatted,
    duplex,
    linkState,
    lacpStatus,
    canSplit,
    splitParent,
    splitChildren,

  };
}

const pageParser = (result) => {
  const allInterfaces = {};
  const interfaces = {};
  result.body.forEach((elm) => {
    if (elm.status.type === 'system') {
      const inf = parseInterface(elm);
      allInterfaces[inf.id] = inf;
    }
  });

  Object.keys(allInterfaces).forEach(infId => {
    if (!allInterfaces[infId].splitParent) {
      if (allInterfaces[infId].cfgLaneSplit === 'split' &&
            allInterfaces[infId].splitChildren) {
        allInterfaces[infId].splitChildren.forEach(childId => {
          const splitChildrenId = childId.split('/').pop();
          interfaces[splitChildrenId] = allInterfaces[splitChildrenId];
        });
      }
      interfaces[infId] = allInterfaces[infId];
    }
  });

  return { interfaces };
};


const detailParser = (result) => {
  // parse the interface
  let cfg = result[0].body.configuration;
  const stats = result[0].body.statistics.statistics;
  const inf = parseInterface(result[0].body);
  if (inf.linkState === 'up') {
    inf.rxBytes = Number(stats.rx_bytes) || 0;
    inf.txBytes = Number(stats.tx_bytes) || 0;
    inf.rxPackets = Number(stats.rx_packets) || 0;
    inf.txPackets = Number(stats.tx_packets) || 0;
    inf.rxErrors = Number(stats.rx_errors) || 0;
    inf.rxDropped = Number(stats.rx_dropped) || 0;
    inf.txDropped = Number(stats.tx_dropped) || 0;
    inf.txErrors = Number(stats.tx_errors) || 0;
    inf.lldp = parseLldp(result[0].body);
    inf.lag = parseLag(result[0].body);
  } else {
    inf.lldp = {};
    inf.lag = {};
  }
  // parse the port (if available)
  const port = {};
  if (result[1]) {
    cfg = result[1].body.configuration;
    port.admin = cfg[C.PORT_ADMIN];
    port.ipV4 = cfg.ip4_address;
    port.ipV6 = cfg.ip6_address;
  }

  return { interface: inf, port };
};

const editParser = (result) => {
  // parse the interface
  let cfg = result[0].body.configuration;
  const uc = cfg[C.USER_CFG];
  const userCfg = {
    [C.ADMIN]: (uc && uc[C.ADMIN]) || C.ADMIN_DEF,
    [C.DUPLEX]: (uc && uc[C.DUPLEX]) || C.DUPLEX_DEF,
    [C.AUTO_NEG]: (uc && uc[C.AUTO_NEG]) || C.AUTO_NEG_DEF,
    [C.FLOW_CTRL]: (uc && uc[C.FLOW_CTRL]) || C.FLOW_CTRL_DEF,
    [C.LANE_SPLIT]: (uc && uc[C.LANE_SPLIT]) || C.LANE_SPLIT_DEF,
  };
  const id = result.infId;
  const etag = result[0].headers.etag;
  const inf = { [C.USER_CFG]: userCfg, etag };
  // parse the port (if available)
  const port = {};
  if (result[1]) {
    cfg = result[1].body.configuration;
    port[C.PORT_ADMIN] = cfg[C.PORT_ADMIN];
    port.etag = result[1].headers.etag;
  }

  return { edit: { id, interface: inf, port } };
};

const SEL_CFG = 'selector=configuration';
const URL_INFS = '/rest/v1/system/interfaces';
const URL_INFS_D1 = `${URL_INFS}?depth=1`;
const URL_PORTS = '/rest/v1/system/ports';
const URL_VRF = '/rest/v1/system/vrfs/vrf_default';

function infPatch(send, mStore, resultCb) {
  const id = mStore.edit.id;
  const etag = mStore.edit.interface.etag;
  const URL_INF = `${URL_INFS}/${id}`;
  const URL_INF_SEL_CFG = `${URL_INF}?${SEL_CFG}`;
  Agent.patch(URL_INF_SEL_CFG)
    .send(send)
    .set('If-Match', etag)
    .end(resultCb);
}

function patchPortAdminUp(url, send, etag, resultCb) {
  Agent.patch(url)
    .send(send)
    .set('If-Match', etag)
    .end(resultCb);
}

function createPort(id, URL_INF, resultCb) {
  const infUrl = URL_INF;
  Agent.post(URL_PORTS)
    .send({
      configuration: {
        admin: 'up',
        name: id,
        interfaces: [infUrl],
      },
      'referenced_by': [{uri: URL_VRF}],
    })
    .set('If-None-Match', '*')
    .end(resultCb);
}

function fetchInfAndPort(URL_INF, URL_PORT, resultCb) {
  Async.parallel([
    cb => Agent.get(URL_INFS_D1).end(cb),
    cb => Agent.get(URL_INF).end(cb),
    cb => Agent.get(URL_PORT).end(cb),
  ], resultCb);
}

function fetchInf(URL_INF, resultCb) {
  Async.parallel([
    cb => Agent.get(URL_INFS_D1).end(cb),
    cb => Agent.get(URL_INF).end(cb),
  ], resultCb);
}


function createorPatchPort(admin, mStore, resultCb) {
  const id = mStore.edit.id;
  const etag = mStore.edit.port.etag;
  const URL_PORT = `${URL_PORTS}/${id}`;
  const URL_PORT_SEL_CFG = `${URL_PORT}?${SEL_CFG}`;
  const URL_INF = `${URL_INFS}/${id}`;
  const send = [{op: 'add', path: '/admin', value: admin}];
  if (mStore.edit.port.etag) {
    patchPortAdminUp(URL_PORT_SEL_CFG, send, etag, resultCb);
  } else {
    createPort(id, URL_INF, resultCb);
  }
}

function deletePortsForInfs(infs, resultCb) {
  Async.waterfall([
    cb1 => Agent.get(URL_PORTS).end(cb1),
    (res1, cb2) => {
      const reqs = [];
      infs.forEach(infId => {
        const url = `${URL_PORTS}/${infId}`;
        if (res1.body.indexOf(url) >= 0) {
          reqs.push(cb => Agent.delete(url).end(cb));
        }
      });
      Async.series(reqs, cb2);
    }
  ], resultCb);
}

function deleteParentPort(mStore, resultCb) {
  const id = mStore.edit.id;
  const URL_PORT = `${URL_PORTS}/${id}`;
  if (mStore.edit.port.etag) {
    Agent.delete(URL_PORT).end(resultCb);
  } else {
    resultCb(null, {});
  }
}


const ACTIONS = {

  fetchPage() {
    return (dispatch) => {
      dispatch(AD.action('REQUEST', { title: t('loading') }));
      Agent.get(URL_INFS_D1).end((error, result) => {
        if (error) { return dispatch(AD.action('FAILURE', { error })); }
        return dispatch(AD.action('SUCCESS', { result, parser: pageParser } ));
      });
    };
  },

  fetchDetail(infId) {
    const URL_INF = `${URL_INFS}/${infId}`;
    const URL_PORT = `${URL_PORTS}/${infId}`;

    return (dispatch) => {
      dispatch(AD.action('REQUEST', { title: t('loading') }));
      Async.waterfall([
        // Step: fetch the inteface data
        cb1 => Agent.get(URL_INF).end(cb1),
        // Step: fetch the list of port URLs
        (r1, cb2) => Agent.get(URL_PORTS).end((e2, r2) => cb2(e2, r1, r2)),
        // Step: if the port exists fetch the port data
        (r1, r2, cb3) => {
          if (r2.body.indexOf(URL_PORT) < 0) {
            cb3(null, [r1]);
          } else {
            Agent.get(URL_PORT).end((e3, r3) => cb3(e3, [r1, r3]));
          }
        }
      ], (error, result) => {
        if (error) { return dispatch(AD.action('FAILURE', { error })); }
        return dispatch(AD.action('SUCCESS', { result, parser: detailParser }));
      });
    };
  },

  fetchEdit(infId) {
    const URL_INF_SEL_CFG = `${URL_INFS}/${infId}?${SEL_CFG}`;
    const URL_PORT = `${URL_PORTS}/${infId}`;
    const URL_PORT_SEL_CFG = `${URL_PORT}?${SEL_CFG}`;

    return (dispatch) => {
      dispatch(AD.action('REQUEST', { title: t('loading') }));
      Async.waterfall([
        // Step: fetch the inteface data with etag
        cb1 => Agent.get(URL_INF_SEL_CFG).end(cb1),
        // Step: fetch the list of port URLs
        (r1, cb2) => Agent.get(URL_PORTS).end((e2, r2) => cb2(e2, r1, r2)),
        // Step: if the port already exists fetch the port data with etag
        (r1, r2, cb3) => {
          if (r2.body.indexOf(URL_PORT) < 0) {
            cb3(null, [r1]);
          } else {
            Agent.get(URL_PORT_SEL_CFG).end((e3, r3) => cb3(e3, [r1, r3]));
          }
        }
      ], (error, result) => {
        if (error) { return dispatch(AD.action('FAILURE', { error })); }
        result.infId = infId;
        return dispatch(AD.action('SUCCESS', { result, parser: editParser }));
      });
    };
  },

  edit(state) {
    const uc = C.copyWithoutDefs(state[C.USER_CFG]);
    const admin = uc[C.ADMIN] || 'down'; // the port admin needs this as well
    const laneSplit = uc[C.LANE_SPLIT] || '';
    return (dispatch, getStoreFn) => {
      dispatch(AD.action('REQUEST', { title: t('deploying'), numSteps: 3 }));
      const mStore = getStoreFn()[NAME];
      const id = mStore.edit.id;
      const URL_INF = `${URL_INFS}/${id}`;
      const URL_PORT = `${URL_PORTS}/${id}`;
      // if split don't use admin, autoNeg, duplex and flowCtrl from state,
      // Use mStore data for above four fields.

      const send = Object.keys(uc).length === 0
          ? [{op: 'remove', path: '/user_config'}]
          : [{op: 'add', path: '/user_config', value: uc}];
      Async.waterfall([
        // Step: if no port post, else patch
        cb1 => {
          dispatch(AD.action('REQUEST_STEP', { currStep: 1 }));
          if (laneSplit === '') {
            createorPatchPort(admin, mStore, cb1);
          } else if (laneSplit === 'split') {
            deleteParentPort(mStore, cb1);
          }
        },
        // Step: interface patch add or remove based on defaults
        (r1, cb2) => {
          dispatch(AD.action('REQUEST_STEP', { currStep: 2 }));
          infPatch(send, mStore, cb2);
        },
        // Step: refresh the page and details
        (r2, cb3) => {
          dispatch(AD.action('REQUEST_STEP', { currStep: 3 }));
          // if split don't fetch the ports/X
          if (laneSplit === 'split') {
            fetchInf(URL_INF, cb3);
          } else {
            fetchInfAndPort(URL_INF, URL_PORT, cb3);
          }
        }
      ], (error, result) => {
        if (error) { return dispatch(AD.action('FAILURE', { error })); }
        const parser = (r) => {
          return {
            ...pageParser(r[0]),
            ...detailParser([r[1], r[2]]),
            edit: { ...INITIAL_STORE.edit },
          };
        };
        return dispatch(AD.action('SUCCESS', { result, parser }));
      });
    };
  },

  unsplit() {
    return (dispatch, getStoreFn) => {
      const mStore = getStoreFn()[NAME];
      const id = mStore.edit.id;
      const URL_INF = `${URL_INFS}/${id}`;
      dispatch(AD.action('REQUEST', { title: t('deploying'), numSteps: 3 }));
      Async.waterfall([
        cb1 => {
          //delete all the ports of children
          //TODO: Just make sure all children exist before deleting
          dispatch(AD.action('REQUEST_STEP', { currStep: 1 }));
          deletePortsForInfs(mStore.interface.splitChildren, cb1);
        },
        (r1, cb2) => {
          // Remove lane_split from parent interface
          dispatch(AD.action('REQUEST_STEP', { currStep: 2 }));
          const send = [{op: 'remove', path: '/user_config'}];
          infPatch(send, mStore, cb2);
        },

        (r2, cb3) => {
          //get ports, interfaces
          dispatch(AD.action('REQUEST_STEP', { currStep: 3 }));
          fetchInf(URL_INF, cb3);
        }
      ], (error, result) => {
        if (error) { return dispatch(AD.action('FAILURE', { error })); }
        const parser = (r) => {
          return {
            ...pageParser(r[0]),
            ...detailParser([r[1], r[2]]),
            edit: { ...INITIAL_STORE.edit },
          };
        };
        return dispatch(AD.action('SUCCESS', { result, parser }));
      });
    };
  },

  clearError() {
    return AD.action('CLEAR_ERROR');
  },

};

export default {
  NAME,
  NAVS,
  ACTIONS,
  REDUCER: AD.reducer(),
};
