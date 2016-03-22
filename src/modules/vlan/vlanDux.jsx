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
import { t } from 'i18n/lookup.js';
import VlanPage from './vlanPage.jsx';
import VlanEdit from './vlanEdit.jsx';
import Agent, { mkAgentHandler, getParallel } from 'agent.js';
import Async from 'async';
import {
  tlVlanOperState,
  tlVlanOperStateReason,
  tlPortVlanMode,
} from 'translater.js';


const NAME = 'vlan';

const NAVS = [
  {
    route: { path: '/vlan', component: VlanPage },
    link: { path: '/vlan', order: 300 }
  },
  {
    route: { path: '/vlan/:id', component: VlanEdit },
    link: { path: '/vlan', hidden: true }
  },
  {
    route: { path: '/vlan/inf/:id', component: VlanEdit },
    link: { path: '/vlan', hidden: true }
  },
];

const PAGE_ASYNC = 'page';
const PAGE_AT = Dux.mkAsyncActionTypes(NAME, PAGE_ASYNC);

// const SEL_CFG = 'selector=configuration';

const URL_INFS = '/rest/v1/system/interfaces';
const URL_INFS_D1 = `${URL_INFS}?depth=1`;

const URL_VLANS = '/rest/v1/system/bridges/bridge_normal/vlans';
const URL_VLANS_D1 = `${URL_VLANS}?depth=1`;

const URL_PORTS = '/rest/v1/system/ports';
const URL_PORTS_D1 = `${URL_PORTS}?depth=1`;

// const BRIDGE_URL = '/rest/v1/system/bridges/bridge_normal/';

const ACTIONS = {

  fetch() {
    return (dispatch, getStoreFn) => {
      const mStore = getStoreFn()[NAME];
      if (Dux.waitForCooldown(mStore, PAGE_ASYNC, Date.now())) {
        Dux.dispatchRequest(dispatch, PAGE_AT, t('loading'));
        getParallel([
          URL_INFS_D1,
          URL_VLANS_D1,
          URL_PORTS_D1,
        ], Dux.mkAsyncDispatcher(dispatch, PAGE_AT));
      }
    };
  },

  addVlan(newVlanId) {
    return (dispatch) => {
      Dux.dispatchRequest(dispatch, PAGE_AT, `${t('addVlan')}: ${newVlanId}`, 2);
      Async.waterfall(
        [
          // Step: create the new VLAN
          cb => {
            Dux.dispatchRequestStep(dispatch, PAGE_AT, 1);
            Agent
              .post(URL_VLANS)
              .send({
                configuration: {
                  admin: 'down',
                  id: Number(newVlanId),
                  name: `VLAN${newVlanId}`,
                },
              })
              .set('If-None-Match', '*')
              .end(mkAgentHandler(URL_VLANS, cb));
          },
          // Step: refresh the page data
          (result, cb) => {
            Dux.dispatchRequestStep(dispatch, PAGE_AT, 2);
            getParallel([
              URL_INFS_D1,
              URL_VLANS_D1,
              URL_PORTS_D1,
            ], cb);
          }
        ],
        Dux.mkAsyncDispatcher(dispatch, PAGE_AT)
      );
    };
  },

  // NEED TO FIGURE OUT HOW TO UPDATE THE MODEL UNDER 'page' and 'set'

  //
  // editVlanInterface(data, cfg) {
  //   return (dispatch) => {
  //     const dispatcher = Dux.mkAsyncDispatcher(dispatch, SET_AT);
  //     const port = data.interfaces[cfg.id];
  //     const URL = `${PORTS_URL}/${cfg.id}`;
  //     if (port) {
  //       Agent.patch(URL)
  //         .send([
  //           {op: 'add', path: '/tag', value: Number(cfg.tag)},
  //           {op: 'add', path: '/vlan_mode', value: 'access'},
  //         ])
  //         // .set('If-Match', detail.port.etag) // FIXME: etag
  //         .end(mkAgentHandler(URL, dispatcher));
  //     } else {
  //       const INF_URL = `${INFS_URL}/${cfg.id}`;
  //       Agent.post(PORTS_URL)
  //         .send({
  //           configuration: {
  //             name: cfg.id,
  //             interfaces: [ INF_URL ],
  //             tag: Number(cfg.tag),
  //             'vlan_mode': 'access',
  //           },
  //           'referenced_by': [{uri: BRIDGE_URL}],
  //         })
  //         // .set('If-Match', detail.ports.etag)
  //         .end(mkAgentHandler(PORTS_URL, dispatcher));
  //     }
  //   };
  // },

  clearErrorForSet() {
    return { type: PAGE_AT.CLEAR_ERROR };
  },

};

function parsePageResult(result) {

  const interfaces = {};
  result[0].body.forEach(elm => {
    const cfg = elm.configuration;
    if (cfg.type === 'system') {
      const id = cfg.name;
      interfaces[id] = { id };
    }
  });

  const vlans = {};
  result[1].body.forEach(elm => {
    const cfg = elm.configuration;
    const status = elm.status;
    const id = cfg.id;
    vlans[id] = {
      id,
      name: cfg.name,
      admin: cfg.admin,
      operState: tlVlanOperState(status.oper_state),
      operStateReason: tlVlanOperStateReason(status.oper_state_reason),
      interfaces: {},
    };
  });

  const ports = {};
  result[2].body.forEach(elm => {
    const cfg = elm.configuration;
    if (cfg.vlan_mode) {
      const id = cfg.name;
      const data = {
        id,
        tag: cfg.tag,
        trunks: cfg.trunks,
        vlanMode: tlPortVlanMode(cfg.vlan_mode),
        interface: interfaces[id],
      };
      if (data.tag) {
        vlans[data.tag].interfaces[id] = data;
      }
      if (data.trunks) {
        data.trunks.forEach(vid => vlans[vid].interfaces[id] = data);
      }
    }
  });

  return { interfaces, vlans, ports };
}

const INITIAL_STORE = {
  page: {
    ...Dux.mkAsyncStatus(),
    vlans: {},
    interfaces: {},
    ports: {},
  },
  set: {
    ...Dux.mkAsyncStatus(),
  }
};

const REDUCER = Dux.mkReducer(INITIAL_STORE, [
  Dux.mkAsyncHandler(NAME, PAGE_ASYNC, PAGE_AT, parsePageResult),
  // Dux.mkAsyncHandler(NAME, SET_ASYNC, SET_AT),
]);

export default {
  NAME,
  NAVS,
  ACTIONS,
  REDUCER,
};
