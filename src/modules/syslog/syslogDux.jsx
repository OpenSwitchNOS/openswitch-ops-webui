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
const URL = '/rest-poc/v1/system/bridges/bridge_normal';
const ACTIONS = {
  fetch(filter) {
    const url = `${URL}/${filter}`;
    return Dux.fetchAction(NAME, url);
  }
};

const INITIAL_STORE = {
  entities: {},
  lastRead: 0,
  length: 0,
};

const syslogData = {
  '1': {
    severity: 0,
    date: '2015-12-17 00:00:00',
    facility: 'Auth',
    text: 'This is Emerg syslog with Severity: 0'
  },
  '2': {
    severity: 1,
    date: '2015-12-17 01:01:01',
    facility: 'Auth',
    text: 'This is Alert syslog with Severity: 1'
  },
  '3': {
    severity: 2,
    date: '2015-12-17 02:02:02',
    facility: 'System',
    text: 'This is Critical syslog with Severity: 2'
  },
  '4': {
    severity: 3,
    date: '2015-12-17 03:03:03',
    facility: 'System',
    text: 'This is Error syslog with Severity: 3'
  },
  '5': {
    severity: 4,
    date: '2015-12-17 04:04:04',
    facility: 'LAG',
    text: 'This is Warning syslog with Severity: 4'
  },
  '6': {
    severity: 5,
    date: '2015-12-17 05:05:05',
    facility: 'LLDP',
    text: 'This is Notice syslog with Severity: 5'
  },
  '7': {
    severity: 6,
    date: '2015-12-17 06:06:06',
    facility: 'LLDP',
    text: 'This is Info syslog with Severity: 6'
  },
  '8': {
    severity: 7,
    date: '2015-12-17 07:07:07',
    facility: 'LLDP',
    text: 'This is Debug syslog with Severity: 7'
  },
};


function parseResult() {
  //const body = result.body;

  let entities = {};
  // let length = 0;
  //
  // Object.getOwnPropertyNames(body).forEach(k => {
  //   const data = body[k];
  //   if (k !== 'length') {
  //     entities[k] = {
  //       id: k,
  //       name: data.configuration.name,
  //     };
  //   } else {
  //     length = data;
  //   }
  // });

  // for fake data
  entities = syslogData;
  return { length: entities.length, entities };
}

const REDUCER = Dux.fetchReducer(NAME, INITIAL_STORE, parseResult);

export default {
  NAME,
  NAVS,
  ACTIONS,
  REDUCER,
};
