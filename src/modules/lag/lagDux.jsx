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
// import LagEdit from './lagEdit.jsx';


const NAME = 'lag';

const NAVS = [
  {
    route: { path: '/lag', component: LagPage },
    link: { path: '/lag', order: 600 }
  },
  {
    route: { path: '/lag/:id', component: LagDetails },
    link: { path: '/lag', hidden: true }
  },
  // {
  //   route: { path: '/lag/:id', component: LagEdit },
  //   link: { path: '/lag', hidden: true }
  // },
  //
];


const INITIAL_STORE = {
  lags: {},
  edit: {}
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
      lags[id] = lag;
    }
  });

  // parse the interfaces
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

  return { lags };
}

const URL_PORTS_D1 = '/rest/v1/system/ports?depth=1';
const URL_INFS_D1 = '/rest/v1/system/interfaces?depth=1';

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

//   addLag(lag) {
//     const PORTS_URL = '/rest/v1/system/ports/';
//     const BRIDGE_URL = '/rest/v1/system/bridges/bridge_normal/';
//     if (lag.lagId) {
//       return (dispatch) => {
//         const dispatcher = Dux.mkAsyncDispatcher(dispatch, SET_AT);
//         Agent.post(PORTS_URL)
//         .send({
//           configuration: {
//             name: `lag${lag.lagId}`,
//             lacp: lag.aggregationMode,
//           },
//           'referenced_by': [{uri: BRIDGE_URL}],
//         })
//       .end(mkAgentHandler(PORTS_URL, dispatcher));
//       };
//     }
//   },
//
//
//
//
//   editLag(lag, lagPorts, lagId) {
//     const PORTS_URL_APPENDED = `/rest/v1/system/ports/lag${lagId}`;
//     const reqs = [];
//     const interfaces = [];
//     let j = 0;
//     Object.keys(lag).forEach(i => {
//       interfaces[j] = `/rest/v1/system/interfaces/${lag[i].id}`;
//       j++;
//     });
//     return (dispatch) => {
//
//       Object.keys(lag).forEach(i => {
//         if (lagPorts[i] && (lagPorts[i].id === lag[i].id)) {
//           const pathPassed = Number(lag[i].id);
//           reqs.push(cb => Agent.delete(`/rest/v1/system/ports/${pathPassed}`)
//             .end(mkAgentHandler('/rest/v1/system/ports/', cb)));
//         }
//       });
//
//       Object.keys(lag).forEach(i => {
//         const URL = `/rest/v1/system/interfaces/${lag[i].id}`;
//         reqs.push(cb =>
//             Agent.patch(URL)
//     .send([{op: 'add', path: '/user_config', value: { admin: 'up'}},
//     {op: 'add', path: '/other_config', value: {'lacp-aggregation-key': lagId}}])
//         .end(mkAgentHandler(URL, cb)));
//       });
//       reqs.push( cb => Agent.patch(PORTS_URL_APPENDED)
//         .send([{op: 'add', path: '/interfaces', value: interfaces}])
//         .end(mkAgentHandler(PORTS_URL_APPENDED, cb)));
//
//
//       Dux.dispatchRequest(dispatch, SET_AT);
//       const dispatcher = Dux.mkAsyncDispatcher(dispatch, SET_AT);
//       Async.series(reqs, dispatcher);
//     };
//   },
//
//
//   removeInterfaceFromLag(lagInterfaces) {
//     const INTERFACES_URL = '/rest/v1/system/interfaces/';
//     return (dispatch) => {
//       const dispatcher = Dux.mkAsyncDispatcher(dispatch, SET_AT);
//       Object.keys(lagInterfaces).forEach(i => {
//         Agent.patch(`${INTERFACES_URL}${lagInterfaces[i]}`)
//         .send([{op: 'remove', path: '/other_config'}])
//         .end(mkAgentHandler(INTERFACES_URL, dispatcher));
//       });
//     };
//   },
//
//   deletingLag(lagId, lagInterfaces) {
//     const PORTS_URL = '/rest/v1/system/ports/';
//     const INTERFACES_URL = '/rest/v1/system/interfaces/';
//     const reqs = [];
//
//     return (dispatch) => {
//       reqs.push(cb => {
//         Agent.delete(`${PORTS_URL}lag${lagId}`)
//         .end(mkAgentHandler(PORTS_URL, cb));
//       });
//
//       Object.keys(lagInterfaces).forEach(i => {
//         const intUrl = `${INTERFACES_URL}${lagInterfaces[i].id}`;
//         reqs.push(cb => Agent.patch(intUrl)
//         .send([{op: 'remove', path: '/other_config'}])
//         .end(mkAgentHandler(INTERFACES_URL, cb)));
//       });
//
//       Dux.dispatchRequest(dispatch, SET_AT);
//       const dispatcher = Dux.mkAsyncDispatcher(dispatch, SET_AT);
//       Async.series(reqs, dispatcher);
//     };
//   },
//
  clearError() {
    return AD.action('CLEAR_ERROR');
  },



};

//
//   const availableInterfaces = {};
//   result[1].body.forEach(elm => {
//     const cfg = elm.configuration;
//     const id = cfg.name;
//     const tmp = cfg.other_config;
//     const lacpAggregatoinKey = (tmp && tmp['lacp-aggregation-key']) || '';
//     if (!(lacpAggregatoinKey !== '')) {
//       const data = {
//         id,
//       };
//       availableInterfaces[id] = data;
//     }
//   });
//
//
//   const vlans = {};
//   result[0].body.forEach(elm => {
//     const cfg = elm.configuration;
//     const id = cfg.name;
//     if (cfg.vlan_mode) {
//       const idModified = id.substring(3);
//       const regularExpression = /^lag/;
//       if (regularExpression.test(id)) {
//         const data = {
//           idModified,
//           tag: cfg.tag || '',
//           trunks: cfg.trunks || '',
//           mode: cfg.vlan_mode || '',
//         };
//         vlans[idModified] = data;
//         if (data.tag) {
//           lags[idModified].vlans[data.tag] = data;
//         }
//         if (data.trunks) {
//           data.trunks.forEach(e => lags[idModified].vlans[e] = data);
//         }
//       }
//     }
//   });
// //TODO: Rename and find a better way to do it.
//   const ports = {};
//   result[0].body.forEach(elm => {
//     const cfg = elm.configuration;
//     const id = cfg.name;
//     const data = {
//       id,
//     };
//     ports[id] = data;
//   });
//
//
//   return {lags, lagInterfaces, availableInterfaces, ports};
// }
//
// const REDUCER = Dux.mkReducer(INITIAL_STORE, [
//   Dux.mkAsyncHandler(NAME, PAGE_ASYNC, PAGE_AT, parsePageResult),
//   Dux.mkAsyncHandler(NAME, SET_ASYNC, SET_AT),
// ]);

export default {
  NAME,
  NAVS,
  ACTIONS,
  REDUCER: AD.reducer(),
};
