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
import VlanPage from './vlanPage.jsx';
import VlanPage2 from './vlanPage2.jsx';
import VlanEdit from './vlanEdit.jsx';
import Agent, { mkAgentHandler } from 'agent.js';


const NAME = 'vlan';

const PAGE_ASYNC = 'page';
const PAGE_AT = Dux.mkAsyncActionTypes(NAME, PAGE_ASYNC);

const SET_ASYNC = 'set';
const SET_AT = Dux.mkAsyncActionTypes(NAME, SET_ASYNC);


const NAVS = [
  {
    route: { path: '/vlan', component: VlanPage },
    link: { path: '/vlan', order: 300 }
  },
  {
    route: { path: '/vlan2', component: VlanPage2 },
    link: { path: '/vlan2', order: 305 }
  },
  {
    route: { path: '/vlan/:id', component: VlanEdit },
    link: { path: '/vlan', hidden: true }
  },
];

const QP_CFG_SELECT = 'selector=configuration';
const VLANS_URL = '/rest/v1/system/bridges/bridge_normal/vlans';
const VLANS_DEPTH1_CFG_URL = `${VLANS_URL}?depth=1&${QP_CFG_SELECT}`;
const VLANS_CFG_URL = `${VLANS_URL}?${QP_CFG_SELECT}`;
const PORTS_URL = '/rest/v1/system/ports';
const PORTS_DEPTH1_URL = `${PORTS_URL}?depth=1`;
const INFS_URL = '/rest/v1/system/interfaces';
const BRIDGE_URL = '/rest/v1/system/bridges/bridge_normal/';
const FETCH_URLS = [ VLANS_DEPTH1_CFG_URL, PORTS_DEPTH1_URL ];

const ACTIONS = {

  fetch() {
    return (dispatch, getStoreFn) => {
      const mStore = getStoreFn()[NAME];
      Dux.getIfCooledDown(dispatch, mStore, PAGE_ASYNC, PAGE_AT, FETCH_URLS);
    };
  },

  addVlan(data, cfg) {
    return (dispatch) => {
      const dispatcher = Dux.mkAsyncDispatcher(dispatch, SET_AT);
      Agent.post(VLANS_URL)
        .send({
          configuration: {
            admin: 'down',
            id: Number(cfg.id),
            name: `VLAN${cfg.id}`,
          },
        })
        .set('If-Match', data.vlanEtag)
        .end(mkAgentHandler(VLANS_CFG_URL, dispatcher));
    };
  },

  editVlanInterface(data, cfg) {
    return (dispatch) => {
      const dispatcher = Dux.mkAsyncDispatcher(dispatch, SET_AT);
      const port = data.interfaces[cfg.id];
      const URL = `${PORTS_URL}/${cfg.id}`;
      if (port) {
        Agent.patch(URL)
          .send([
            {op: 'add', path: '/tag', value: Number(cfg.tag)},
            {op: 'add', path: '/vlan_mode', value: 'access'},
          ])
          // .set('If-Match', detail.port.etag) // FIXME: etag
          .end(mkAgentHandler(URL, dispatcher));
      } else {
        const INF_URL = `${INFS_URL}/${cfg.id}`;
        Agent.post(PORTS_URL)
          .send({
            configuration: {
              name: cfg.id,
              interfaces: [ INF_URL ],
              tag: Number(cfg.tag),
              'vlan_mode': 'access',
            },
            'referenced_by': [{uri: BRIDGE_URL}],
          })
          // .set('If-Match', detail.ports.etag)
          .end(mkAgentHandler(PORTS_URL, dispatcher));
      }
    };
  },

  clearErrorForSet() {
    return { type: SET_AT.CLEAR_ERROR };
  },

};

function parsePageResult(result) {
  const vlans = {};
  result[0].body.forEach(elm => {
    const cfg = elm.configuration;
    // const status = elm.status;
    const id = cfg.id;
    vlans[id] = {
      id,
      name: cfg.name,
      admin: cfg.admin,
      // operState: status.oper_state,
      // operStateReason: status.oper_state_reason,
      interfaces: {},
    };
  });
  // TODO: We need a consistent way to store the etag and entities (interfaces, lags, vlans, etc.)
  const vlansEtag = result[0].headers.etag;

  const interfaces = {}; // TODO: Should we call this ports?
  result[1].body.forEach(elm => {
    const cfg = elm.configuration;
    if (cfg.vlan_mode) {
      const id = cfg.name;
      const data = {
        id,
        tag: cfg.tag,
        trunks: cfg.trunks,
        mode: cfg.vlan_mode,
      };
      interfaces[id] = data;
      if (data.tag) {
        vlans[data.tag].interfaces[id] = data;
      }
      if (data.trunks) {
        data.trunks.forEach(vid => vlans[vid].interfaces[id] = data);
      }
    }
  });
  const portsEtag = result[1].headers.etag;

  return { vlans, vlansEtag, interfaces, portsEtag };
}

const INITIAL_STORE = {
  page: {
    ...Dux.mkAsyncStore(),
    vlans: {},
    interfaces: {},
  },
  set: {
    ...Dux.mkAsyncStore(),
  }
};

const REDUCER = Dux.mkReducer(INITIAL_STORE, [
  Dux.mkAsyncHandler(NAME, PAGE_ASYNC, PAGE_AT, parsePageResult),
  Dux.mkAsyncHandler(NAME, SET_ASYNC, SET_AT),
]);

export default {
  NAME,
  NAVS,
  ACTIONS,
  REDUCER,
};
