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

const URL = '/rest/v1/system/bridges/bridge_normal/vlans?depth=1';

const ACTIONS = {
  fetch() {
    return (dispatch, getStoreFn) => {
      const mStore = getStoreFn()[NAME];
      Dux.getIfCooledDown(dispatch, mStore, PAGE_ASYNC, PAGE_AT, URL);
    };
  }
};

function parsePageResult(result) {
  const body = result.body;

  let length = 0;
  const entities = {};

  // TODO: incorrectly assumes an object is an array.
  Object.getOwnPropertyNames(body).forEach(k => {
    const data = body[k];
    if (k !== 'length') {
      entities[k] = {
        id: k,
        name: data.configuration.name,
      };
    } else {
      length = data;
    }
  });
  return { length, entities };
}

const INITIAL_STORE = {
  page: {
    ...Dux.mkAsyncStore(),
    entities: {},
    length: 0,
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
