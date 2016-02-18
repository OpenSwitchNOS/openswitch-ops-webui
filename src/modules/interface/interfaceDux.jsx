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
import Utils from 'utils.js';


const NAME = 'interface';

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

const DETAIL_ASYNC = 'detail';
const DETAIL_AT = Dux.mkAsyncActionTypes(NAME, DETAIL_ASYNC);

const SET_ASYNC = 'set';
const SET_AT = Dux.mkAsyncActionTypes(NAME, SET_ASYNC);

const INITIAL_STORE = {
  detail: {
    ...Dux.mkAsyncStore(),
    ports: {
      urls: [],
    },
    port: {},
    inf: {
      lldp: {},
    },
  },
  set: {
    ...Dux.mkAsyncStore(),
  }
};

function parseLldp(body) {
  const ni = body.status.lldp_neighbor_info;
  const ls = body.statistics.lldp_statistics;
  return {
    chassisName: (ni && ni.chassis_name) || '',
    chassisId: (ni && ni.chassis_id) || '',
    ip: (ni && ni.mgmt_ip_list) || '',
    portId: (ni && ni.port_id) || '',
    sysDesc: (ni && ni.chassis_description) || '',
    capsSupported: (ni && ni.chassis_capability_available) || '',
    capsEnabled: (ni && ni.chassis_capability_enabled) || '',

    framesTx: (ls && ls.lldp_tx) || 0,
    framesRx: (ls && ls.lldp_rx) || 0,
    framesRxDiscarded: (ls && ls.lldp_rx_discard) || 0,
    framesRxUnrecog: (ls && ls.lldp_rx_unrecognized) || 0,
  };
}

function parsePorts(ports) {
  return {
    etag: ports.headers.etag,
    urls: ports.body,
  };
}

function parsePort(port) {
  const cfg = port.body.configuration;
  return {
    etag: port.headers.etag,
    id: cfg.name,
    admin: cfg.admin,
  };
}

function parseDetailResult(result) {
  const ports = parsePorts(result.ports);

  const inf = Utils.parseInterfaceResp(result.inf);
  inf.lldp = parseLldp(result.inf.body);

  const port = result.port ? parsePort(result.port) : {};

  return { ports, inf, port };
}

const PORTS_URL = '/rest/v1/system/ports';
const INFS_URL = '/rest/v1/system/interfaces';
const BRIDGE_URL = '/rest/v1/system/bridges/bridge_normal/';

const ACTIONS = {

  set(detail, userCfg) {
    const PATCH_USER_CFG = Utils.userCfgForPatch(userCfg);
    const INF_URL = `${INFS_URL}/${detail.inf.id}`;

    return (dispatch) => {
      const reqs = [];

      // TODO: debug etag changing issue.
      // console.log('=== SET ===');
      //
      // const store = getStoreFn()[NAME];
      //
      // console.log('=== detail.ports.etag', detail.ports.etag);
      // console.log('=== detail.inf.etag', detail.inf.etag);
      // console.log('=== detail.port.etag', detail.port.etag);
      //
      // console.log('=== store.detail.ports.etag', store.detail.ports.etag);
      // console.log('=== store.detail.inf.etag', store.detail.inf.etag);
      // console.log('=== store.detail.port.etag', store.detail.port.etag);

      if (Object.keys(PATCH_USER_CFG).length === 0) {
        reqs.push(cb => Agent.patch(INF_URL)
          .send([{op: 'remove', path: '/user_config'}])
          .set('If-Match', detail.inf.etag)
          .end(mkAgentHandler(INF_URL, cb))
        );
      } else {
        reqs.push(cb => Agent.patch(INF_URL)
          .send([{op: 'add', path: '/user_config', value: PATCH_USER_CFG}])
          .set('If-Match', detail.inf.etag)
          .end(mkAgentHandler(INF_URL, cb))
        );
      }

      if (detail.port.id) {
        const PORT_URL = `${PORTS_URL}/${detail.port.id}`;
        reqs.push(cb => Agent.patch(PORT_URL)
          .send([{op: 'add', path: '/admin', value: userCfg.admin}])
          .set('If-Match', detail.port.etag)
          .end(mkAgentHandler(PORT_URL, cb))
        );
      } else if (userCfg.admin === 'up') {
        reqs.push(cb => Agent.post(PORTS_URL)
          .send({
            configuration: {
              admin: 'up',
              name: detail.inf.id,
              interfaces: [ INF_URL ],
            },
            'referenced_by': [{uri: BRIDGE_URL}],
          })
          .set('If-Match', detail.ports.etag)
          .end(mkAgentHandler(PORTS_URL, cb))
        );
      }

      Dux.dispatchRequest(dispatch, SET_AT);
      const dispatcher = Dux.mkAsyncDispatcher(dispatch, SET_AT);
      Async.parallel(reqs, dispatcher);
    };
  },

  fetchDetails(id) {
    const INF_URL = `${INFS_URL}/${id}`;
    const PORT_URL = `${PORTS_URL}/${id}`;

    return (dispatch) => {
      Dux.dispatchRequest(dispatch, DETAIL_AT);
      const gets = {
        inf: cb => Agent.get(INF_URL).end(mkAgentHandler(INF_URL, cb)),
        ports: cb => Agent.get(PORTS_URL).end(mkAgentHandler(PORTS_URL, cb)),
      };
      Async.parallel(gets, (e1, r1) => {
        if (e1) {
          return Dux.dispatchFail(dispatch, DETAIL_AT, e1);
        }
        if (r1.ports.body.indexOf(PORT_URL) < 0) {
          return Dux.dispatchSuccess(dispatch, DETAIL_AT, r1);
        }
        Agent.get(PORT_URL).end(mkAgentHandler(PORT_URL, (e2, r2) => {
          if (e2) {
            return Dux.dispatchFail(dispatch, DETAIL_AT, e2);
          }
          r1.port = r2;
          return Dux.dispatchSuccess(dispatch, DETAIL_AT, r1);
        }));
      });
    };
  },

  clearErrorForSet() {
    return { type: SET_AT.CLEAR_ERROR };
  },

};

const REDUCER = Dux.mkReducer(INITIAL_STORE, [
  Dux.mkAsyncHandler(NAME, DETAIL_ASYNC, DETAIL_AT, parseDetailResult),
  Dux.mkAsyncHandler(NAME, SET_ASYNC, SET_AT),
]);

export default {
  NAME,
  NAVS,
  ACTIONS,
  REDUCER,
};
