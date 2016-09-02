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
import AsyncDux, { cooledDown } from 'asyncDux.js';
import VlanPage from './vlanPage.jsx';
import Agent from 'agent.js';
import Async from 'async';


const NAME = 'vlan';

const NAVS = [
  {
    route: { path: '/vlan', component: VlanPage },
    link: { path: '/vlan', order: 300 }
  },
];

const INITIAL_STORE = {
  vlans: {},
  interfaces: {},
  ports: {},
};

const AD = new AsyncDux(NAME, INITIAL_STORE);

const parser = (result) => {

  const interfaces = {};
  result[0].body.forEach(elm => {
    const status = elm.status;
    if (status.type === 'system') {
      const id = status.name;
      interfaces[id] = { id };
    }
  });

  const vlans = {};
  result[1].body.forEach(elm => {
    const cfg = elm.configuration;
    const status = elm.status;
    if (!status.internal_usage) {
      const id = cfg.id;
      vlans[cfg.name] = { // for the URI below we need the VLAN name
        id,
        name: cfg.name,
        admin: cfg.admin,
        operState: status.oper_state,
        operStateReason: status.oper_state_reason,
        interfaces: {},
      };
    }
  });

  const ports = {};
  result[2].body.forEach(elm => {
    const cfg = elm.configuration;
    if (cfg.vlan_mode) {
      const id = cfg.name;
      const data = {
        id,
        tag: cfg.vlan_tag,
        trunks: cfg.vlan_trunks,
        vlanMode: cfg.vlan_mode,
        interface: interfaces[id],
      };
      if (data.tag) {
        const vlanName = data.tag[0].split('/').pop();
        vlans[vlanName].interfaces[id] = data;
      }
      if (data.trunks) {
        data.trunks.forEach(vurl => {
          const vlanName = vurl.split('/').pop();
          vlans[vlanName].interfaces[id] = data;
        });
      }
    }
  });

  return { interfaces, vlans, ports };
};

const URL_INFS = '/rest/v1/system/interfaces';
const URL_INFS_D1 = `${URL_INFS}?depth=1`;

const URL_VLANS = '/rest/v1/system/bridges/bridge_normal/vlans';
const URL_VLANS_D1 = `${URL_VLANS}?depth=1`;

const URL_PORTS = '/rest/v1/system/ports';
const URL_PORTS_D1 = `${URL_PORTS}?depth=1`;

// TODO: vlan edit
// const SEL_CFG = 'selector=configuration';
// const BRIDGE_URL = '/rest/v1/system/bridges/bridge_normal/';

const ACTIONS = {

  fetch() {
    return (dispatch, getStoreFn) => {
      const mStore = getStoreFn()[NAME];
      if (cooledDown(mStore, Date.now())) {
        dispatch(AD.action('REQUEST', { title: t('loading') }));
        Async.parallel([
          cb => Agent.get(URL_INFS_D1).end(cb),
          cb => Agent.get(URL_VLANS_D1).end(cb),
          cb => Agent.get(URL_PORTS_D1).end(cb),
        ], (error, result) => {
          if (error) { return dispatch(AD.action('FAILURE', { error })); }
          return dispatch(AD.action('SUCCESS', { result, parser }));
        });
      }
    };
  },

  addVlan(newVlanId) {
    return (dispatch) => {
      const title = `${t('addVlan')} ${newVlanId}`;
      const numSteps = 2;
      dispatch(AD.action('REQUEST', { title, numSteps }));
      Async.waterfall([
        // Step: create the new VLAN
        cb1 => {
          dispatch(AD.action('REQUEST_STEP', { currStep: 1 }));
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
            .end(cb1);
        },
        // Step: refresh the page data
        (r1, cb2) => {
          dispatch(AD.action('REQUEST_STEP', { currStep: 2 }));
          Async.parallel([
            cb => Agent.get(URL_INFS_D1).end(cb),
            cb => Agent.get(URL_VLANS_D1).end(cb),
            cb => Agent.get(URL_PORTS_D1).end(cb),
          ], cb2);
        }
      ], (error, result) => {
        if (error) { return dispatch(AD.action('FAILURE', { error })); }
        return dispatch(AD.action('SUCCESS', { result, parser }));
      });
    };
  },

  // TODO: edit
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
