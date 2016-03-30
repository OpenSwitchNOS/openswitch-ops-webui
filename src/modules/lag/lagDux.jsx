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

function pageParser(result) {
  const lags = {};

  // parse the ports
  result[0].body.forEach(elm => {
    const cfg = elm.configuration;
    const name = cfg.name;

    if (LAG_REGEX.test(name)) {
      const status = elm.status;

      const ls = status.lacp_status;
      const bondStatus = ls && ls.bond_status;

      const id = name.substring(LAG_PREFIX.length);
      const vlanMode = cfg.vlan_mode;
      const vlanIds = cfg.trunks || [];
      if (cfg.tag && vlanIds.indexOf(cfg.tag) < 0) { vlanIds.push(cfg.tag); }

      const lag = {
        name,
        id,
        lacp: cfg.lacp,
        admin: cfg.admin || 'down',
        vlanMode,
        vlanIds,
        bondStatus,
        interfaces: {},
        stats: {},
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
    const id = cfg.name;

    const oc = cfg.other_config;
    const lacpAggrKey = oc && oc['lacp-aggregation-key'];
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
        };
        lag.interfaces[id] = data;
      }
    } else if (cfg.type === 'system') {
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
  });

  return { lags, availInterfaces };
}

const SEL_CFG = 'selector=configuration';
const URL_PORTS = '/rest/v1/system/ports';
const URL_PORTS_D1 = `${URL_PORTS}?depth=1`;
const URL_INFS = '/rest/v1/system/interfaces';
const URL_INFS_D1 = `${URL_INFS}?depth=1`;
const URL_BRIDGE = '/rest/v1/system/bridges/bridge_normal';


const ACTIONS = {

  fetchPage() {
    return (dispatch) => {
      dispatch(AD.action('REQUEST', { title: t('loading') }));
      Async.parallel([
        cb => Agent.get(URL_PORTS_D1).end(cb),
        cb => Agent.get(URL_INFS_D1).end(cb),
      ], (error, result) => {
        if (error) { return dispatch(AD.action('FAILURE', { error })); }
        return dispatch(AD.action('SUCCESS', { result, parser: pageParser } ));
      });
    };
  },

  addLag(state) {
    const oc = { ...state[C.OTHER_CFG] };
    if (oc[C.RATE] === C.RATE_DEF) { delete oc[C.RATE]; }
    if (oc[C.FALLBACK] === C.FALLBACK_DEF) { delete oc[C.FALLBACK]; }
    if (oc[C.HASH] === C.HASH_DEF) { delete oc[C.HASH]; }

    const send = {
      configuration: {
        name: `lag${state.newLagId}`,
        lacp: state[C.AGGR_MODE],
      },
      'referenced_by': [{uri: URL_BRIDGE}],
    };
    if (Object.keys(oc).length > 0) {
      send.configuration[C.OTHER_CFG] = oc;
    }

    return (dispatch) => {
      dispatch(AD.action('REQUEST', { title: t('deploying'), numSteps: 2 }));
      Async.waterfall([
        cb1 => {
          dispatch(AD.action('REQUEST_STEP', { currStep: 1 }));
          Agent.post(URL_PORTS).send(send).set('If-None-Match', '*').end(cb1);
        },
        (r1, cb2) => {
          dispatch(AD.action('REQUEST_STEP', { currStep: 2 }));
          Async.parallel([
            cb => Agent.get(URL_PORTS_D1).end(cb),
            cb => Agent.get(URL_INFS_D1).end(cb),
          ], cb2);
        }
      ], (error, result) => {
        if (error) { return dispatch(AD.action('FAILURE', { error })); }
        return dispatch(AD.action('SUCCESS', { result, parser: pageParser } ));
      });
    };
  },

  deleteLag(lagId, interfaces) {
    const gets = [];
    Object.keys(interfaces).forEach(infId => {
      const url = `${URL_INFS}/${infId}?${SEL_CFG}`;
      gets.push(cb => Agent.get(url).end(cb));
    });

    return (dispatch) => {
      dispatch(AD.action('REQUEST', { title: t('deploying'), numSteps: 9 }));
      Async.waterfall([
        cb1 => {
          dispatch(AD.action('REQUEST_STEP', { currStep: 1 }));
          Async.parallel(gets, cb1);
        },
        (r1, cb2) => {
          const patch = [];
          r1.forEach(res => {
            const infId = res.body.configuration.name;
            const etag = res.headers.etag;
            const url = `${URL_INFS}/${infId}?${SEL_CFG}`;
            patch.push(cb => Agent.patch(url)
              .send([{op: 'remove', path: '/other_config'}])
              .set('If-Match', etag)
              .end(cb));
          });
          Async.series(patch, cb2);
        },
        (r2, cb3) => {
          dispatch(AD.action('REQUEST_STEP', { currStep: 2 }));
          Agent.delete(`${URL_PORTS}/${LAG_PREFIX}${lagId}`).end(cb3);
        },
        (r3, cb4) => {
          dispatch(AD.action('REQUEST_STEP', { currStep: 3 }));
          Async.parallel([
            cb => Agent.get(URL_PORTS_D1).end(cb),
            cb => Agent.get(URL_INFS_D1).end(cb),
          ], cb4);
        }
      ], (error, result) => {
        if (error) { return dispatch(AD.action('FAILURE', { error })); }
        return dispatch(AD.action('SUCCESS', { result, parser: pageParser } ));
      });
    };
  },

  editLag(lagId, state) {
    const URL_LAG = `${URL_PORTS}/${LAG_PREFIX}${lagId}?${SEL_CFG}`;

    return (dispatch) => {
      dispatch(AD.action('REQUEST', { title: t('deploying'), numSteps: 10 }));
      Async.waterfall([
        portsCb => {
          // fetch the ports
          dispatch(AD.action('REQUEST_STEP', { currStep: 1 }));
          Agent.get(URL_PORTS).end(portsCb);
        },
        (portsRes, cb2) => {
          // delete any ports that exists for added interfaces to this LAG
          dispatch(AD.action('REQUEST_STEP', { currStep: 2 }));
          const reqs = [];
          Object.keys(state.diff.added).forEach(infId => {
            const url = `${URL_PORTS}/${infId}`;
            if (portsRes.body.indexOf(url) >= 0) {
              reqs.push(cb => Agent.delete(url).end(cb));
            }
          });
          Async.series(reqs, cb2);
        },
        (r2, cb3) => {
          // fetch etag for each interface that we added to this LAG
          dispatch(AD.action('REQUEST_STEP', { currStep: 3 }));
          const reqs = [];
          Object.keys(state.diff.added).forEach(infId => {
            const url = `${URL_INFS}/${infId}?${SEL_CFG}`;
            reqs.push(cb => Agent.get(url).end(cb));
          });
          Async.series(reqs, cb3);
        },
        (infsDataRes, cb4) => {
          // patch (w/ etag) each interface that we added to this LAG
          dispatch(AD.action('REQUEST_STEP', { currStep: 4 }));
          const reqs = [];
          infsDataRes.forEach(res => {
            const infId = res.body.configuration.name;
            const url = `${URL_INFS}/${infId}?${SEL_CFG}`;
            const etag = res.headers.etag;
            const send = [
              {op: 'add', path: '/user_config', value: { admin: 'up'}},
              {op: 'add', path: '/other_config', value: {
                'lacp-aggregation-key': lagId
              }}
            ];
            reqs.push(cb => {
              Agent.patch(url).send(send).set('If-Match', etag).end(cb);
            });
          });
          Async.series(reqs, cb4);
        },
        (r4, cb5) => {
          // fetch etag for each interface that we removed from this LAG
          dispatch(AD.action('REQUEST_STEP', { currStep: 5 }));
          const reqs = [];
          Object.keys(state.diff.removed).forEach(infId => {
            const url = `${URL_INFS}/${infId}?${SEL_CFG}`;
            reqs.push(cb => Agent.get(url).end(cb));
          });
          Async.series(reqs, cb5);
        },
        (infsDataRes, cb6) => {
          // patch (w/ etag) each interface that we removed from this LAG
          dispatch(AD.action('REQUEST_STEP', { currStep: 6 }));
          const reqs = [];
          infsDataRes.forEach(res => {
            const infId = res.body.configuration.name;
            const url = `${URL_INFS}/${infId}?${SEL_CFG}`;
            const etag = res.headers.etag;
            const send = [{op: 'remove', path: '/other_config'}];
            reqs.push(cb => {
              Agent.patch(url).send(send).set('If-Match', etag).end(cb);
            });
          });
          Async.series(reqs, cb6);
        },
        (r6, cb7) => {
          // fetch etag for LAG port.
          dispatch(AD.action('REQUEST_STEP', { currStep: 7 }));
          Agent.get(URL_LAG).end(cb7);
        },
        (portData, cb8) => {
          // patch (w/ etag) the LAG port with the interface URLs
          dispatch(AD.action('REQUEST_STEP', { currStep: 8 }));
          const urls = [];
          Object.keys(state.lagInfs).forEach(infId => {
            urls.push(`${URL_INFS}/${infId}`);
          });
          const etag = portData.headers.etag;
          const send = [{op: 'add', path: '/interfaces', value: urls}];
          Agent.patch(URL_LAG).send(send).set('If-Match', etag).end(cb8);
        },
        (r8, cb9) => {
          // fetch page data
          dispatch(AD.action('REQUEST_STEP', { currStep: 9 }));
          Async.parallel([
            cb => Agent.get(URL_PORTS_D1).end(cb),
            cb => Agent.get(URL_INFS_D1).end(cb),
          ], cb9);
        }
      ], (error, result) => {
        if (error) { return dispatch(AD.action('FAILURE', { error })); }
        return dispatch(AD.action('SUCCESS', { result, parser: pageParser } ));
      });
    };
  },

  // TODO: setLagDetails(aggregationMode, otherConfigPatch, lagId) {
  //   const PORTS_URL = `/rest/v1/system/ports/lag${lagId}`;
  //   const otherConfiglagPatch = Utils.lagOtherConfig(otherConfigPatch);
  //   if (lagId) {
  //     return (dispatch) => {
  //       const dispatcher = Dux.mkAsyncDispatcher(dispatch, SET_AT);
  //       if (Object.keys(otherConfiglagPatch).length === 0) {
  //         Agent.patch(PORTS_URL)
  //       .send([{ op: 'add', path: '/lacp', value: aggregationMode},
  //               {op: 'remove', path: '/other_config'}])
  //       .end(mkAgentHandler(PORTS_URL, dispatcher));
  //       } else {
  //         Agent.patch(PORTS_URL)
  //         .send([{ op: 'add', path: '/lacp', value: aggregationMode},
  //               {op: 'add', path: '/other_config', value: otherConfiglagPatch}])
  //         .end(mkAgentHandler(PORTS_URL, dispatcher));
  //       }
  //     };
  //   }
  // },

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
