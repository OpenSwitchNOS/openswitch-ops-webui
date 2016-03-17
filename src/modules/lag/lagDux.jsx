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
import LagPage from './lagPage.jsx';
import LagDetails from './lagDetails.jsx';
import Agent, { mkAgentHandler } from 'agent.js';
import Async from 'async';



const NAME = 'lag';

const PAGE_ASYNC = 'page';
const PAGE_AT = Dux.mkAsyncActionTypes(NAME, PAGE_ASYNC);


const INITIAL_STORE = {
  page: {
    ...Dux.mkAsyncStatus(),
    lags: {},
  },
};


const NAVS = [
  {
    route: { path: '/lag', component: LagPage },
    link: { path: '/lag', order: 600 }
  },
  {
    route: { path: '/lag/:id', component: LagDetails },
    link: { path: '/lag', hidden: true }
  },
];

const PORTS_URL_WITH_DEPTH = '/rest/v1/system/ports?depth=1';
const INTERFACES_URL_WITH_DEPTH = '/rest/v1/system/interfaces?depth=1';

const URLS = [ PORTS_URL_WITH_DEPTH, INTERFACES_URL_WITH_DEPTH ];

const ACTIONS = {

  fetch() {
    return (dispatch, getStoreFn) => {
      const mStore = getStoreFn()[NAME];
      Dux.getIfCooledDown(dispatch, mStore, PAGE_ASYNC, PAGE_AT, URLS);
    };
  },

  addLag(lag) {
    const PORTS_URL = '/rest/v1/system/ports/';
    const BRIDGE_URL = '/rest/v1/system/bridges/bridge_normal/';
    if (lag.lagId) {
      return (dispatcher) => {
        Agent.post(PORTS_URL)
        .send({
          configuration: {
            name: `lag${lag.lagId}`,
            lacp: lag.aggregationMode,
          },
          'referenced_by': [{uri: BRIDGE_URL}],
        })
      .end(mkAgentHandler(PORTS_URL, dispatcher));
      };
    }
  },




  editLag(lag, lagPorts, lagId) {
    const PORTS_URL_APPENDED = `/rest/v1/system/ports/lag${lagId}`;
    const reqs = [];
    const interfaces = [];
    let j = 0;
    Object.keys(lag).forEach(i => {
      interfaces[j] = `/rest/v1/system/interfaces/${lag[i].id}`;
      j++;
    });
    return (dispatch) => {

      Object.keys(lag).forEach(i => {
        if (lagPorts[i] && (lagPorts[i].id === lag[i].id)) {
          const pathPassed = Number(lag[i].id);
          reqs.push(cb => Agent.delete(`/rest/v1/system/ports/${pathPassed}`)
            .end(mkAgentHandler('/rest/v1/system/ports/', cb)));
        }
      });

      Object.keys(lag).forEach(i => {
        const URL = `/rest/v1/system/interfaces/${lag[i].id}`;
        reqs.push(cb =>
            Agent.patch(URL)
    .send([{op: 'add', path: '/user_config', value: { admin: 'up'}},
    {op: 'add', path: '/other_config', value: {'lacp-aggregation-key': lagId}}])
        .end(mkAgentHandler(URL, cb)));
      });
      reqs.push( cb => Agent.patch(PORTS_URL_APPENDED)
        .send([{op: 'add', path: '/interfaces', value: interfaces}])
        .end(mkAgentHandler(PORTS_URL_APPENDED, cb)));


      Dux.dispatchRequest(dispatch, PAGE_AT);
      const dispatcher = Dux.mkAsyncDispatcher(dispatch, PAGE_AT);
      Async.series(reqs, dispatcher);
    };
  },


  removeInterfaceFromLag(lagInterfaces) {
    const INTERFACES_URL = '/rest/v1/system/interfaces/';
    return (dispatch) => {
      Object.keys(lagInterfaces).forEach(i => {
        Agent.patch(`${INTERFACES_URL}${lagInterfaces[i]}`)
        .send([{op: 'remove', path: '/other_config'}])
        .end(mkAgentHandler(INTERFACES_URL, dispatch));
      });
    };
  },

  deletingLag(lagId, lagInterfaces) {
    const PORTS_URL = '/rest/v1/system/ports/';
    const INTERFACES_URL = '/rest/v1/system/interfaces/';
    const reqs = [];

    return (dispatch) => {
      reqs.push(cb => {
        Agent.delete(`${PORTS_URL}lag${lagId}`)
        .end(mkAgentHandler(PORTS_URL, cb));
      });

      Object.keys(lagInterfaces).forEach(i => {
        const intUrl = `${INTERFACES_URL}${lagInterfaces[i].id}`;
        reqs.push(cb => Agent.patch(intUrl)
        .send([{op: 'remove', path: '/other_config'}])
        .end(mkAgentHandler(INTERFACES_URL, cb)));
      });

      Dux.dispatchRequest(dispatch, PAGE_AT);
      const dispatcher = Dux.mkAsyncDispatcher(dispatch, PAGE_AT);
      Async.series(reqs, dispatcher);
    };
  },

};

function parsePageResult(result) {
  const lags = {};
  result[0].body.forEach(elm => {
    const cfg = elm.configuration;
    const id = cfg.name;
    const status = elm.status;
    const tmp = status.lacp_status;
    const bondStatus = (tmp && tmp.bond_status) || '';
    const regularExpression = /^lag/;
    const idModified = id.substring(3);
    if (regularExpression.test(id)) {
      lags[idModified] = {
        idModified,
        name: id,
        lacp: cfg.lacp || '',
        status: cfg.admin || 'down',
        vlanMode: cfg.vlan_mode || '',
        interfaces: cfg.interfaces || '',
        bondStatus,
        vlans: {},
        lagInterfaces: {},
        availableInterfacesForLag: {},
      };
      if (elm.configuration.interfaces) {
        for (const i in elm.configuration.interfaces) {
          const interfaceId = elm.configuration.interfaces[i].substring(27);
          lags[idModified].interfaces[i] = interfaceId;
        }
        lags[idModified].interfaces = lags[idModified].interfaces.join(',');
      }
    }
  });

  const lagInterfaces = {};
  result[1].body.forEach(elm => {
    const cfg = elm.configuration;
    const id = cfg.name;
    const tmp = cfg.other_config;
    const lacpAggregatoinKey = (tmp && tmp['lacp-aggregation-key']) || '';
    if (lacpAggregatoinKey !== '') {
      const data = {
        id,
        rxBytes: elm.statistics.statistics.rx_bytes || 0,
        rxPackets: elm.statistics.statistics.rx_packets || 0,
        rxErrors: elm.statistics.statistics.rx_errors || 0,
        rxDropped: elm.statistics.statistics.rx_dropped || 0,
        txBytes: elm.statistics.statistics.tx_bytes || 0,
        txPackets: elm.statistics.statistics.tx_packets || 0,
        txErrors: elm.statistics.statistics.tx_errors || 0,
        txDropped: elm.statistics.statistics.tx_dropped || 0,
        speed: elm.status.link_speed || 0,
        lacpAggregatoinKey,
      };
      lagInterfaces[id] = data;
      //TODO: lags Not Available in the below scope.
      if (data.lacpAggregatoinKey !== '') {
        lags[data.lacpAggregatoinKey].lagInterfaces[id] = data;
      }
    }
  });

  const availableInterfaces = {};
  result[1].body.forEach(elm => {
    const cfg = elm.configuration;
    const id = cfg.name;
    const tmp = cfg.other_config;
    const lacpAggregatoinKey = (tmp && tmp['lacp-aggregation-key']) || '';
    if (!(lacpAggregatoinKey !== '')) {
      const data = {
        id,
      };
      availableInterfaces[id] = data;
    }
  });


  const vlans = {};
  result[0].body.forEach(elm => {
    const cfg = elm.configuration;
    const id = cfg.name;
    if (cfg.vlan_mode) {
      const idModified = id.substring(3);
      const regularExpression = /^lag/;
      if (regularExpression.test(id)) {
        const data = {
          idModified,
          tag: cfg.tag || '',
          trunks: cfg.trunks || '',
          mode: cfg.vlan_mode || '',
        };
        vlans[idModified] = data;
        if (data.tag) {
          lags[idModified].vlans[data.tag] = data;
        }
        if (data.trunks) {
          data.trunks.forEach(e => lags[idModified].vlans[e] = data);
        }
      }
    }
  });
//TODO: Rename and find a better way to do it.
  const ports = {};
  result[0].body.forEach(elm => {
    const cfg = elm.configuration;
    const id = cfg.name;
    const data = {
      id,
    };
    ports[id] = data;
  });


  return {lags, lagInterfaces, availableInterfaces, ports};
}

const REDUCER = Dux.mkReducer(INITIAL_STORE, [
  Dux.mkAsyncHandler(NAME, PAGE_ASYNC, PAGE_AT, parsePageResult),
]);

export default {
  NAME,
  NAVS,
  ACTIONS,
  REDUCER,
};
