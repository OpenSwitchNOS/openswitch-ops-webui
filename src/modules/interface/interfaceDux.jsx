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
import InterfacePage from './interfacePage.jsx';
import InterfaceDetails from './interfaceDetails.jsx';
import Agent, { mkAgentHandler } from 'agent.js';


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

const PAGE_ASYNC = 'page';
const PAGE_AT = Dux.mkAsyncActionTypes(NAME, PAGE_ASYNC);

const DETAIL_ASYNC = 'detail';
const DETAIL_AT = Dux.mkAsyncActionTypes(NAME, DETAIL_ASYNC);

const SET_ASYNC = 'set';
const SET_AT = Dux.mkAsyncActionTypes(NAME, SET_ASYNC);

const PORTS_URL = '/rest/v1/system/ports';
const INFS_URL = '/rest/v1/system/interfaces';
const BRIDGE_URL = '/rest/v1/system/bridges/bridge_normal/';

const PAGE_URLS = [ PORTS_URL ];

const INITIAL_STORE = {
  page: {
    ...Dux.mkAsyncStore(),
    portRefs: {
      urls: [],
    },
  },
  detail: {
    ...Dux.mkAsyncStore(),
    port: {},
    inf: {},
  },
  set: {
    ...Dux.mkAsyncStore(),
  }
};

function parsePageResult(result) {
  const portRefs = {
    urls: result[0].body,
    etag: result[0].headers.etag
  };
  return { portRefs };
}

function parseDetailResult(result) {
  let cfg = result[0].body.configuration;
  const cfgUc = cfg.user_config;
  const adminUserUp = cfgUc && cfgUc.admin === 'up';
  const inf = {
    id: cfg.name,
    adminUserUp,
    etag: result[0].headers.etag,
  };
  const port = {};
  if (result.length > 1) {
    cfg = result[1].body.configuration;
    port.id = cfg.name;
    port.adminUserUp = cfg.admin === 'up';
    port.etag = result[1].headers.etag;
  }
  return { inf, port };
}

function agentAddPort(id, mStore, cb) {
  const INF_URL = `${INFS_URL}/${id}`;
  const PORT_URL = `${PORTS_URL}/${id}`;
  Agent
    .post(PORT_URL)
    .send({
      configuration: {
        name: id,
        interfaces: [ INF_URL ],
      },
      'referenced_by': [{
        uri: BRIDGE_URL,
      }],
    })
    .set('If-Match', mStore.page.portRefs.etag)
    .end(mkAgentHandler(PORT_URL, cb));
}

function checkAgentAddPort(id, mStore, cb) {
  const PORT_URL = `${PORTS_URL}/${id}`;
  if (mStore.page.portRefs.urls.indexOf(PORT_URL) > 0) {
    return cb(null, {});
  }
  agentAddPort(id, mStore, cb);
}

function agentSetPortAdmin(id, mStore, up, cb) {
  const PORT_URL = `${PORTS_URL}/${id}`;
  Agent
    .patch(PORT_URL)
    .send([{
      op: 'add',
      path: '/admin',
      value: up ? 'up' : 'down',
    }])
    .set('If-Match', mStore.detail.port.etag)
    .end(mkAgentHandler(PORT_URL, cb));
}

function checkAgentSetPortAdmin(id, mStore, up, cb) {
  if (mStore.detail.port.adminUserUp === up) { return cb(null, {}); }
  agentSetPortAdmin(id, mStore, up, cb);
}

function agentSetInfAdmin(id, mStore, up, cb) {
  const INF_URL = `${INFS_URL}/${id}`;
  Agent
    .patch(INF_URL)
    .send([{
      op: 'add',
      path: '/user_config/admin',
      value: up ? 'up' : 'down',
    }])
    .set('If-Match', mStore.detail.inf.etag)
    .end(mkAgentHandler(INF_URL, cb));
}

function checkAgentSetInfAdmin(id, mStore, up, cb) {
  if (mStore.detail.inf.adminUserUp === up) { return cb(null, {}); }
  agentSetInfAdmin(id, mStore, up, cb);
}

function enable(dispatch, mStore, id) {
  Dux.dispatchRequest(dispatch, SET_AT);
  checkAgentAddPort(id, mStore, (e1) => {
    if (e1) { return Dux.dispatchFail(dispatch, SET_AT, e1); }
    checkAgentSetPortAdmin(id, mStore, true, (e2) => {
      if (e2) { return Dux.dispatchFail(dispatch, SET_AT, e2); }
      checkAgentSetInfAdmin(id, mStore, true, (e3) => {
        if (e3) { return Dux.dispatchFail(dispatch, SET_AT, e3); }
        return Dux.dispatchSuccess(dispatch, SET_AT);
      });
    });
  });
}

function disable(dispatch, mStore, id) {
  Dux.dispatchRequest(dispatch, SET_AT);
  checkAgentSetPortAdmin(id, mStore, false, (e1) => {
    if (e1) { return Dux.dispatchFail(dispatch, SET_AT, e1); }
    checkAgentSetInfAdmin(id, mStore, false, (e2) => {
      if (e2) { return Dux.dispatchFail(dispatch, SET_AT, e2); }
      return Dux.dispatchSuccess(dispatch, SET_AT);
    });
  });
}

const ACTIONS = {

  fetchPage() {
    return (dispatch) => {
      Dux.get(dispatch, PAGE_AT, PAGE_URLS);
    };
  },

  fetchDetails(id) {
    const INF_URL = `${INFS_URL}/${id}`;
    const PORT_URL = `${PORTS_URL}/${id}`;
    return (dispatch, getStoreFn) => {
      const mStore = getStoreFn()[NAME];
      const portExists = mStore.page.portRefs.urls.indexOf(PORT_URL) >= 0;
      const urls = portExists ? [ INF_URL, PORT_URL ] : [ INF_URL ];
      Dux.get(dispatch, DETAIL_AT, urls);
    };
  },

  set(user) {
    return (dispatch, getStoreFn) => {
      const store = getStoreFn();
      const mStore = store[NAME];
      if (user.adminUserUp) {
        enable(dispatch, mStore, user.id);
      } else {
        disable(dispatch, mStore, user.id);
      }
    };
  },

  clearErrorForSet() {
    return { type: SET_AT.CLEAR_ERROR };
  },

};

const REDUCER = Dux.mkReducer(INITIAL_STORE, [
  Dux.mkAsyncHandler(NAME, PAGE_ASYNC, PAGE_AT, parsePageResult),
  Dux.mkAsyncHandler(NAME, DETAIL_ASYNC, DETAIL_AT, parseDetailResult),
  Dux.mkAsyncHandler(NAME, SET_ASYNC, SET_AT),
]);

export default {
  NAME,
  NAVS,
  ACTIONS,
  REDUCER,
};
