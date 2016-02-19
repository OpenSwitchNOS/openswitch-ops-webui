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
import SyslogPage from './syslogPage.jsx';

const NAME = 'syslog';

const NAVS = [
  {
    route: { path: '/syslog', component: SyslogPage },
    link: { path: '/syslog', order: 400 }
  },
];

const PAGE_ASYNC = 'page';
const PAGE_AT = Dux.mkAsyncActionTypes(NAME, PAGE_ASYNC);

// TODO - for syslog REST
const URL = '/rest/v1/system/syslogs';

function buildUrl(filter) {
  let url = URL;
  url=`${URL}?priority=${filter.priority}`;
  url=`${url}&since=${filter.since}&until=${filter.until}`;
  return url;
}

const ACTIONS = {

  fetch(filter) {
    const url = buildUrl(filter);
    return (dispatch, getStoreFn) => {
      const mStore = getStoreFn()[NAME];
      Dux.getIfCooledDown(dispatch, mStore, PAGE_ASYNC, PAGE_AT, url);
    };
  },

};

function parsePageResult(result) {
  const body = result.body;

  const entities = {};

  // TODO: Incorrectly assuming data is an object but is an array of objects
  Object.getOwnPropertyNames(body).forEach(k => {
    const data = body[k];
    if (k !== 'length') {
      entities[k] = Object.assign({}, data);
    }
  });

  return { length: entities.length, entities };
}

const INITIAL_STORE = {
  page: {
    ...Dux.mkAsyncStore(),
    entities: {},
    lastRead: 0,
    length: 0,
  }
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
