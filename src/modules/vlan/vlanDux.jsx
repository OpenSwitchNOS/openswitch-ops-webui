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
import VlanDetails from './vlanDetails.jsx';


const NAME = 'vlan';

const PAGE_ASYNC = 'page';
const PAGE_AT = Dux.mkAsyncActionTypes(NAME, PAGE_ASYNC);

const NAVS = [
  {
    route: { path: '/vlan', component: VlanPage },
    link: { path: '/vlan', order: 300 }
  },
  {
    route: { path: '/vlan/:id', component: VlanDetails },
    link: { path: '/vlan', hidden: true }
  },
];

const VLANS_URL = '/rest/v1/system/bridges/bridge_normal/vlans?depth=1';
const PORTS_URL = '/rest/v1/system/ports?depth=1';
const URLS = [ VLANS_URL, PORTS_URL ];

const ACTIONS = {
  fetch() {
    return (dispatch, getStoreFn) => {
      const mStore = getStoreFn()[NAME];
      Dux.getIfCooledDown(dispatch, mStore, PAGE_ASYNC, PAGE_AT, URLS);
    };
  }
};

function parsePageResult(result) {
  const vlans = {};
  result[0].body.forEach(elm => {
    const cfg = elm.configuration;
    const status = elm.status;
    const id = cfg.id;
    vlans[id] = {
      id,
      name: cfg.name,
      admin: cfg.admin,
      operState: status.oper_state,
      operStateReason: status.oper_state_reason,
      interfaces: {},
    };
  });

  const interfaces = {};
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

  return { vlans, interfaces };
}

const INITIAL_STORE = {
  page: {
    ...Dux.mkAsyncStore(),
    vlans: {},
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
