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
import Async from 'async';


const NAME = 'interface';

const ACTION_TYPES = Dux.fetchActionTypes(NAME);

const URL_PORTS = '/rest/v1/system/ports';
const URL_INFS = '/rest/v1/system/interfaces';
const URL_BRIDGE = '/rest/v1/system/bridges/bridge_normal/';

// TODO: need to verify that the etag is doing something or we need
// to explicitly test the patch/post for etag equal to passed in header.


function createPort(id, store, cb) {
  const URL_INF = `${URL_INFS}/${id}`;
  Agent
    .post(URL_PORTS)
    .send({
      configuration: {
        name: id,
        interfaces: [ URL_INF ],
      },
      'referenced_by': [{
        uri: URL_BRIDGE,
      }],
    })
    .set('etag', store.ports.etag)
    .end(mkAgentHandler(URL_PORTS, cb));
}

function patchPortEnabled(id, store, value, cb) {
  const URL_PORT = `${URL_PORTS}/${id}`;
  Agent
    .patch(URL_PORT)
    .send([{
      op: 'add',
      path: '/admin',
      value: value ? 'up' : 'down',
    }])
    .set('etag', store.port.etag)
    .end(mkAgentHandler(URL_PORT, cb));
}

function patchInterfaceEnabled(id, store, value, cb) {
  const URL_INF = `${URL_INFS}/${id}`;
  Agent
    .patch(URL_INF)
    .send([{
      op: 'add',
      path: '/user_config/admin',
      value: value ? 'up' : 'down',
    }])
    .set('etag', store.entity.etag)
    .end(mkAgentHandler(URL_INF, cb));
}

const ACTIONS = {
  fetch(id) {
    const URL_INF = `${URL_INFS}/${id}`;
    const URL_PORT = `${URL_PORTS}/${id}`;

    return (dispatch) => {

      function dispatcher(e1, r1) {
        if (e1) {
          dispatch({ type: ACTION_TYPES.FAILURE, error: e1 });
        } else if (r1[0].body.indexOf(URL_PORT) >= 0) {
          Agent.get(URL_PORT).end(mkAgentHandler(URL_PORT, (e2, r2) => {
            if (e2) {
              dispatch({ type: ACTION_TYPES.FAILURE, error: e2 });
            } else {
              r1.push(r2);
              dispatch({ type: ACTION_TYPES.SUCCESS, result: r1 });
            }
          }));
        } else {
          dispatch({ type: ACTION_TYPES.SUCCESS, result: r1 });
        }
      }

      dispatch({ type: ACTION_TYPES.REQUEST });

      Async.parallel([
        cb => Agent.get(URL_PORTS).end(mkAgentHandler(URL_PORTS, cb)),
        cb => Agent.get(URL_INF).end(mkAgentHandler(URL_INF, cb)),
      ], dispatcher);
    };
  },

  adminStateUp(id) {
    return (dispatch, getStoreFn) => {
      const store = getStoreFn()[NAME];

      // FIXME: have the function determine if necessary and invoke callback with success for next step?

      if (!store.port.id) {
        createPort(id, store, (e1, r1) => {
          console.log(e1);
          console.log(r1);
          if (!e1) {
            patchPortEnabled(id, store, true, (e2, r2) => {
              console.log(e2);
              console.log(r2);
              if (!e2) {
                patchInterfaceEnabled(id, store, true, (e3, r3) => {
                  console.log(e2);
                  console.log(r2);
                });
              }
            });
          }
        });
      } else {
        patchPortEnabled(id, store, true, (e1, r1) => {
          console.log(e1);
          console.log(r1);
          if (!e1) {
            patchInterfaceEnabled(id, store, true, (e2, r2) => {
              console.log(e2);
              console.log(r2);
            });
          }
        });
      }
    };
  },

  adminStateDown(id) {
    return (dispatch, getStoreFn) => {
      const store = getStoreFn()[NAME];

      if (store.port.id) {
        patchPortEnabled(id, store, false, (e1, r1) => {
          console.log(e1);
          console.log(r1);
          if (!e1) {
            patchInterfaceEnabled(id, store, false, (e2, r2) => {
              console.log(e2);
              console.log(r2);
            });
          }
        });
      } else {
        patchInterfaceEnabled(id, store, true, (e1, r1) => {
          console.log(e1);
          console.log(r1);
        });
      }
    };
  },

};

const INITIAL_STORE = {
  ports: {},
  entity: {},
  port: {},
};

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

function parseResult(result) {
  const ports = {
    etag: result[0].headers.etag,
  };

  const infCfg = result[1].body.configuration;
  const uc = infCfg.user_config;
  const adminState = (uc && uc.admin === 'up') ? 'up' : 'down';
  const entity = {
    id: infCfg.name,
    adminState,
    etag: result[1].headers.etag,
  };

  const port = {};
  if (result.length > 2) {
    const portCfg = result[2].body.configuration;
    port.id = portCfg.name;
    port.adminState = portCfg.admin === 'up' ? 'up' : 'down';
    port.etag = result[2].headers.etag;
  }

  return {
    ports,
    entity,
    port,
  };
}

const REDUCER = Dux.fetchReducer(NAME, INITIAL_STORE, parseResult);

export default {
  NAME,
  NAVS,
  ACTIONS,
  REDUCER,
};
