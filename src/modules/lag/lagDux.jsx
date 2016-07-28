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

/*eslint no-console:0*/

import { t } from 'i18n/lookup.js';
import Agent from 'agent.js';
import AsyncDux from 'asyncDux.js';
import Async from 'async';
import { sumValues } from 'calc.js';
import LagPage from './lagPage.jsx';
import LagDetails from './lagDetails.jsx';
import * as C from './lagConst.js';


// TODO: in general we should not grab the etag without the lastest data
// TODO: we should follow the pattern of grabing the new data and etag when
// TODO: the edit page is displayed
// TODO: Create a routing vs. non-routing port?
// TODO: fetch the etag when the edit loads.
// TODO: maybe fetch the lag port if there is a selection because we might have
//       stale date that we are using for the details and edit panels.

const NAME = 'lag';

const NAVS = [
  {
    route: { path: '/lag', component: LagPage },
    link: { path: '/lag', order: 325 }
  },
  {
    route: { path: '/lag/:id', component: LagDetails },
    link: { path: '/lag', hidden: true }
  },
];

const INITIAL_STORE = {
  lags: {},
};

const AD = new AsyncDux(NAME, INITIAL_STORE);

const LAG_PREFIX = 'lag';
const LAG_REGEX = /^lag/;

// This is a default.  Lower numeric is higher priority.
const PARTNER_SYS_PRIO = 65534;

function getLagStatus(infs) {
  const lagStatus = {};
  Object.getOwnPropertyNames(infs).forEach(key => {
    const status = infs[key].lagStatus;
    if (status) {
      lagStatus.actorKey = status.actor_key;
      lagStatus.actorSystemId = status.actor_system_id;
      // Choose higher system priority with lower numeric value
      const prio = status.partner_system_id.split(',')[0];
      if (prio > 0 && prio <= PARTNER_SYS_PRIO) {
        lagStatus.partnerKey = status.partner_key;
        lagStatus.partnerSystemId = status.partner_system_id;
      }
    }
  });
  return lagStatus;
}

function parsePortsInfs(result) {
  const lags = {};

  // parse the ports
  result[0].body.forEach(elm => {
    const cfg = elm.configuration;
    const name = cfg.name;

    if (LAG_REGEX.test(name)) {
      const status = elm.status;

      const ls = status.bond_status;
      const bondStatus = ls && ls.up;

      const id = name.substring(LAG_PREFIX.length);
      const vlanMode = cfg.vlan_mode;
      const vlanIds = [];

      if (cfg.vlan_trunks) {
        cfg.vlan_trunks.forEach(vurl => {
          vlanIds.push(vurl.split('/').pop());
        });
      }

      if (cfg.vlan_tag) {
        vlanIds.push(cfg.vlan_tag[0].split('/').pop());
      }

      const lag = {
        name,
        id,
        lacp: cfg.lacp || 'off',
        admin: cfg.admin || 'down',
        vlanMode,
        vlanIds,
        bondStatus,
        interfaces: {},
        stats: {},
        status: {}
      };

      const oc = cfg[C.OTHER_CFG];
      lag[C.FALLBACK] = (oc && oc[C.FALLBACK]) || C.FALLBACK_DEF;
      lag[C.RATE] = (oc && oc[C.RATE]) || C.RATE_DEF;
      lag[C.HASH] = (oc && oc[C.HASH]) || C.HASH_DEF;

      lags[id] = lag;
    }
  });

  // parse the interfaces
  const availInterfaces = {};
  result[1].body.forEach(elm => {
    const cfg = elm.configuration;
    const stats = elm.statistics.statistics;
    const status = elm.status;
    const id = status.name;
    const oc = cfg.other_config;
    const lacpAggrKey = oc && oc[C.LACP_AGGR_KEY];
    if (lacpAggrKey) {
      const lag = lags[lacpAggrKey];
      if (!lag) {
        console.log(`Bad lacp-aggregation-key ${lacpAggrKey} for LAG ${id}`);
      } else {
        const data = {
          id,
          rxBytes: Number(stats.rx_bytes) || 0,
          rxPackets: Number(stats.rx_packets) || 0,
          rxErrors: Number(stats.rx_errors) || 0,
          rxDropped: Number(stats.rx_dropped) || 0,
          txBytes: Number(stats.tx_bytes) || 0,
          txPackets: Number(stats.tx_packets) || 0,
          txErrors: Number(stats.tx_errors) || 0,
          txDropped: Number(stats.tx_dropped) || 0,
          speed: status.link_speed ? Number(status.link_speed) : 0,
          lacpAggrKey,
          lagStatus: elm.status.lacp_status,
        };
        lag.interfaces[id] = data;
      }
    } else if (status.type === 'system') {
      availInterfaces[id] = { id };
    }
  });

  const STAT_KEYS = [
    'rxBytes', 'rxPackets', 'rxErrors', 'rxDropped',
    'txBytes', 'txPackets', 'txErrors', 'txDropped',
    'speed'
  ];
  Object.getOwnPropertyNames(lags).forEach(lagId => {
    const lag = lags[lagId];
    lag.stats = sumValues(lag.interfaces, STAT_KEYS);
    lag.status = getLagStatus(lag.interfaces);
  });

  return { lags, availInterfaces };
}

const SEL_INF_STAT = 'selector=status';
const SEL_PORT_CFG = 'selector=configuration';
const URL_PORTS = '/rest/v1/system/ports';
const URL_PORTS_D1 = `${URL_PORTS}?depth=1`;
const URL_INFS = '/rest/v1/system/interfaces';
const URL_INFS_D1 = `${URL_INFS}?depth=1`;
const URL_BRIDGE = '/rest/v1/system/bridges/bridge_normal';
const DEF_VLAN = '/rest/v1/system/bridges/bridge_normal/vlans/DEFAULT_VLAN_1';


function fetchInfsSelCfg(infs, resultCb) {
  const reqs = [];
  Object.keys(infs).forEach(infId => {
    const url = `${URL_INFS}/${infId}?${SEL_INF_STAT}`;
    reqs.push(cb => Agent.get(url).end(cb));
  });
  Async.series(reqs, resultCb);
}

function addInfsToLag(infs, lagId, resultCb) {
  Async.waterfall([
    cb1 => fetchInfsSelCfg(infs, cb1),
    (resArray, cb2) => {
      const reqs = [];
      resArray.forEach(res => {
        const infId = res.body.status.name;
        const url = `${URL_INFS}/${infId}?${SEL_INF_STAT}`;
        const etag = res.headers.etag;
        const send = [
          {op: 'add', path: '/user_config', value: { admin: 'up'}},
          {op: 'add', path: `/${[C.OTHER_CFG]}`, value: {
            [C.LACP_AGGR_KEY]: lagId
          }}
        ];
        reqs.push(cb => {
          Agent.patch(url).send(send).set('If-Match', etag).end(cb);
        });
      });
      Async.series(reqs, cb2);
    }
  ], resultCb);
}

function removeInfsFromLag(infs, resultCb) {
  Async.waterfall([
    cb1 => fetchInfsSelCfg(infs, cb1),
    (resArray, cb2) => {
      const reqs = [];
      resArray.forEach(res => {
        const id = res.body.status.name;
        const url = `${URL_INFS}/${id}?${SEL_INF_STAT}`;
        const etag = res.headers.etag;
        const send = [{op: 'remove', path: `/${[C.OTHER_CFG]}`}];
        reqs.push(cb => {
          Agent.patch(url).send(send).set('If-Match', etag).end(cb);
        });
      });
      Async.series(reqs, cb2);
    }
  ], resultCb);
}

function deletePortsForInfs(infs, resultCb) {
  Async.waterfall([
    cb1 => Agent.get(URL_PORTS).end(cb1),
    (res1, cb2) => {
      const reqs = [];
      Object.keys(infs).forEach(infId => {
        const url = `${URL_PORTS}/${infId}`;
        if (res1.body.indexOf(url) >= 0) {
          reqs.push(cb => Agent.delete(url).end(cb));
        }
      });
      Async.series(reqs, cb2);
    }
  ], resultCb);
}

function fetchPortsInfsD1(resultCb) {
  Async.parallel([
    cb => Agent.get(URL_PORTS_D1).end(cb),
    cb => Agent.get(URL_INFS_D1).end(cb),
  ], resultCb);
}

function createLag(state, resultCb) {
  const infsIds = Object.keys(state.lagInfs);
  const infsUrls = infsIds.map(i => `${URL_INFS}/${i}`);
  const oc = C.copyWithoutDefs(state[C.OTHER_CFG]);
  const send = {
    configuration: {
      name: `lag${state.lagId}`,
      'vlan_tag': [DEF_VLAN],
      lacp: state[C.AGGR_MODE],
      'vlan_mode': 'access',
      interfaces: infsUrls,
      [C.OTHER_CFG]: oc,
    },
    'referenced_by': [{uri: URL_BRIDGE}],
  };
  Agent.post(URL_PORTS).send(send).set('If-None-Match', '*').end(resultCb);
}

function patchLag(state, resultCb) {
  const lagUrl = `${URL_PORTS}/${LAG_PREFIX}${state.lagId}?${SEL_PORT_CFG}`;
  Async.waterfall([
    cb1 => Agent.get(lagUrl).end(cb1),
    (lagRes, cb2) => {
      const etag = lagRes.headers.etag;
      const infsIds = Object.keys(state.lagInfs);
      const infsUrls = infsIds.map(i => `${URL_INFS}/${i}`);
      const send = [
        {op: 'add', path: `/${[C.AGGR_MODE]}`, value: state[C.AGGR_MODE]},
        {op: 'add', path: '/interfaces', value: infsUrls},
      ];
      const oc = C.copyWithoutDefs(state[C.OTHER_CFG]);
      if (Object.keys(oc).length > 0) {
        send.push({op: 'add', path: `/${[C.OTHER_CFG]}`, value: oc});
      } else {
        const currOc = lagRes.body.configuration[C.OTHER_CFG];
        if (currOc) {
          send.push({op: 'remove', path: `/${[C.OTHER_CFG]}`});
        }
      }
      Agent.patch(lagUrl).send(send).set('If-Match', etag).end(cb2);
    }
  ], resultCb);
}

const ACTIONS = {

  fetchPage() {
    return (dispatch) => {
      dispatch(AD.action('REQUEST', { title: t('loading') }));
      fetchPortsInfsD1((error, result) => {
        if (error) { return dispatch(AD.action('FAILURE', { error })); }
        return dispatch(AD.action('SUCCESS', {
          result, parser: parsePortsInfs
        }));
      });
    };
  },

  addLag(state) {
    return (dispatch) => {
      dispatch(AD.action('REQUEST', { title: t('deploying'), numSteps: 4 }));
      Async.series([
        cb => {
          dispatch(AD.action('REQUEST_STEP', { currStep: 1 }));
          deletePortsForInfs(state.diff.added, cb);
        },
        cb => {
          dispatch(AD.action('REQUEST_STEP', { currStep: 2 }));
          addInfsToLag(state.diff.added, state.lagId, cb);
        },
        cb => {
          dispatch(AD.action('REQUEST_STEP', { currStep: 3 }));
          createLag(state, cb);
        },
        cb => {
          dispatch(AD.action('REQUEST_STEP', { currStep: 4 }));
          fetchPortsInfsD1(cb);
        },
      ], (error, result) => {
        if (error) { return dispatch(AD.action('FAILURE', { error })); }
        return dispatch(AD.action('SUCCESS', {
          result: result[3], parser: parsePortsInfs
        }));
      });
    };
  },

  editLag(state) {
    return (dispatch) => {
      dispatch(AD.action('REQUEST', { title: t('deploying'), numSteps: 5 }));
      Async.series([
        cb => {
          dispatch(AD.action('REQUEST_STEP', { currStep: 1 }));
          removeInfsFromLag(state.diff.removed, cb);
        },
        cb => {
          dispatch(AD.action('REQUEST_STEP', { currStep: 2 }));
          deletePortsForInfs(state.diff.added, cb);
        },
        cb => {
          dispatch(AD.action('REQUEST_STEP', { currStep: 3 }));
          addInfsToLag(state.diff.added, state.lagId, cb);
        },
        cb => {
          dispatch(AD.action('REQUEST_STEP', { currStep: 4 }));
          patchLag(state, cb);
        },
        cb => {
          dispatch(AD.action('REQUEST_STEP', { currStep: 5 }));
          fetchPortsInfsD1(cb);
        },
      ], (error, result) => {
        if (error) { return dispatch(AD.action('FAILURE', { error })); }
        return dispatch(AD.action('SUCCESS', {
          result: result[4], parser: parsePortsInfs
        }));
      });
    };
  },

  // TODO: should the delete fetch the interfaces for the LAG at this time?
  deleteLag(lagId, infs) {
    return (dispatch) => {
      dispatch(AD.action('REQUEST', { title: t('deploying'), numSteps: 3 }));
      Async.series([
        cb => {
          dispatch(AD.action('REQUEST_STEP', { currStep: 1 }));
          removeInfsFromLag(infs, cb);
        },
        cb => {
          dispatch(AD.action('REQUEST_STEP', { currStep: 2 }));
          Agent.delete(`${URL_PORTS}/${LAG_PREFIX}${lagId}`).end(cb);
        },
        cb => {
          dispatch(AD.action('REQUEST_STEP', { currStep: 3 }));
          fetchPortsInfsD1(cb);
        },
      ], (error, result) => {
        if (error) { return dispatch(AD.action('FAILURE', { error })); }
        return dispatch(AD.action('SUCCESS', {
          result: result[2], parser: parsePortsInfs
        }));
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
