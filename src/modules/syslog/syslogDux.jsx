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
    // filter has endPath such as syslog and 2 other queries for time and
    // priority
    return Dux.fetchAction(NAME, buildUrl(filter));
  }
};

const INITIAL_STORE = {
  entities: {},
  lastRead: 0,
  length: 0,
};

function parseResult(result) {
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

const REDUCER = Dux.fetchReducer(NAME, INITIAL_STORE, parseResult);

export default {
  NAME,
  NAVS,
  ACTIONS,
  REDUCER,
};
