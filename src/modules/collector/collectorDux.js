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

const NAME = 'collector';

const URLS = [
  '/rest/v1/system/subsystems/base',
  '/rest/v1/system',
  '/rest-poc/v1/system/interfaces',
  '/rest-poc/v1/system/ports',
];

const AUTO_ACTIONS = {
  fetch() { return Dux.fetchAction(NAME, URLS); }
};

const INITIAL_STORE = {
  info: {},
  interfaces: {
    length: 0,
    entities: {},
  },
  ports: {
    length: 0,
    entities: {},
  },
};

function parseResult(result) {
  const sysBody = result[1].body;
  const infBody = result[2].body;
  const portBody = result[3].body;

  const info = {
    hostName: sysBody.configuration.hostname,
  };

  let length = 0;
  let entities = {};

  Object.getOwnPropertyNames(infBody).forEach(k => {
    const data = infBody[k];
    if (k !== 'length') {
      entities[k] = {
        id: k,
        adminState: data.status.admin_state,
      };
    } else {
      length = data;
    }
  });
  const interfaces = { length, entities };

  length = 0;
  entities = {};

  Object.getOwnPropertyNames(portBody).forEach(k => {
    const data = portBody[k];
    if (k !== 'length') {
      entities[k] = {
        id: k,
        name: data.configuration.name,
      };
    } else {
      length = data;
    }
  });
  const ports = { length, entities };

  return { info, interfaces, ports };
}

const REDUCER = Dux.fetchReducer(NAME, INITIAL_STORE, parseResult);

export default {
  NAME,
  AUTO_ACTIONS,
  REDUCER,
};
