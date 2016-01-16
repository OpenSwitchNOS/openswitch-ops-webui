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

import { mkFetchHandler, mkFetchReducer } from 'dux.js';
import Agent, { mkAgentHandler } from 'agent.js';
import Async from 'async';
import OverviewPage from './overviewPage.jsx';


// Required 'MODULE' name
export const MODULE = 'overview';

// Optional 'NAVS' object
export const NAVS = [
  {
    route: { path: '/overview', component: OverviewPage },
    link: { path: '/overview', order: 100 }
  },
];

const FETCH_REQUEST = `${MODULE}/FETCH_REQUEST`;
const FETCH_FAILURE = `${MODULE}/FETCH_FAILURE`;
const FETCH_SUCCESS = `${MODULE}/FETCH_SUCCESS`;

const SS_BASE_URL = '/rest/v1/system/subsystems/base';
const SYS_URL = '/rest/v1/system';

const UPDATE_INTERVAL = 10000;

// Optional 'ACTIONS' object
export const ACTIONS = {

  fetch() {
    return (dispatch, getStoreFn) => {
      const store = getStoreFn();
      const now = Date.now();

      if (store.isFetching || now - store.lastInfoUpdate < UPDATE_INTERVAL) {
        return;
      }

      dispatch({ type: FETCH_REQUEST });

      const handler = mkFetchHandler(dispatch, FETCH_FAILURE, FETCH_SUCCESS);
      const ah = mkAgentHandler;

      Async.parallel(
        {
          ssBase: (cb) => { Agent.get(SS_BASE_URL).end(ah(SS_BASE_URL, cb)); },
          sys: (cb) => { Agent.get(SYS_URL).end(ah(SYS_URL, cb)); },
        },
        handler,
      );
    };
  }

};

export function setup() {
  // TODO: special action that will get called by the framework once during
  // TODO: initialization, setup the timer here.
}

// Optional 'reducer' function
export const reducer = mkFetchReducer(
  MODULE,
  { FETCH_REQUEST, FETCH_FAILURE, FETCH_SUCCESS },
  {
    info: {
      initialValue: {},
      protectedParser: (result) => {
        return {
          hostName: result.sys.body.configuration,
        };
      },
    },
    // metrics: {
    //   initialValue: {},
    //   protectedParser: (result) => {
    //     return {};
    //   },
    // }
  }
);
