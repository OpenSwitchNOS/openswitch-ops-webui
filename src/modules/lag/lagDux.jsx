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
import Async from 'async';
import Agent, {mkAgentHandler} from 'agent.js';


const NAME = 'lag';

const PAGE_ASYNC = 'page';
const PAGE_AT = Dux.mkAsyncActionTypes(NAME, PAGE_ASYNC);

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

const VLANS_URL = '/rest/v1/system/bridges/bridge_normal/vlans?depth=1';
const PORTS_URL = '/rest/v1/system/ports?depth=1';
const INTERFACES_URL = '/rest/v1/system/interfaces?depth=1';
const PORT_URL = '/rest/v1/system/ports/';

const URLS = [ VLANS_URL, PORTS_URL, INTERFACES_URL, PORT_URL ];

const ACTIONS = {

  fetchDetails(id) {
    const LAG_URL = `${PORT_URL}/${id}`;

    return (dispatch) => {
      Dux.dispatchRequest(dispatch, PAGE_AT);
      const gets = {
        inf:
          cb => Agent.get(LAG_URL).end(mkAgentHandler(LAG_URL, cb)),
      };
      Async.parallel(gets, (e1) => {
        if (e1) {
          return Dux.dispatchFail(dispatch, PAGE_AT, e1);
        }
      });
    };
  },

  fetch() {
    return (dispatch, getStoreFn) => {
      const mStore = getStoreFn()[NAME];
      Dux.getIfCooledDown(dispatch, mStore, PAGE_ASYNC, PAGE_AT, URLS);
    };
  }
};

function parsePageResult(result) {
  const lags = {};
  result[1].body.forEach(elm => {
    const cfg = elm.configuration;
    const id = cfg.name;
    const regularExpression = /^lag/;
    const idModified = id.substring(3);
    if (regularExpression.test(id)) {
      lags[idModified] = {
        idModified,
        name: id,
        lacp: cfg.lacp,
        status: cfg.admin || 'down',
        vlanMode: cfg.vlan_mode || '',
        interfaces: cfg.interfaces || '',
        vlans: {},
      };
      for (const i in elm.configuration.interfaces) {
        lags[idModified].interfaces[i] = elm.configuration.interfaces[i].substring(27);
      }
      lags[idModified].interfaces = lags[idModified].interfaces.join(',');
    }
  });

  const vlans = {};
  result[1].body.forEach(elm => {
    const cfg = elm.configuration;
    const id = cfg.name;
    if (cfg.vlan_mode) {
      const idModified = id.substring(3);
      const regularExpression = /^lag/;
      if (regularExpression.test(id)) {
        const data = {
          idModified,
          tag: cfg.tag,
          trunks: cfg.trunks,
          mode: cfg.vlan_mode,
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


  return {lags};
}

const INITIAL_STORE = {
  page: {
    ...Dux.mkAsyncStore(),
    lags: {},
  },
};

const REDUCER = Dux.mkReducer(INITIAL_STORE, [
  Dux.mkAsyncHandler(NAME, PAGE_ASYNC, PAGE_AT, parsePageResult),
]);

export default {
  NAME,
  NAVS,
  ACTIONS,
  REDUCER,
};
