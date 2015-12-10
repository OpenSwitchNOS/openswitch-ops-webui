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

import InterfacePage from './interfacePage.jsx';
import Agent from 'agent.js';

// Required 'MODULE' name
export const MODULE = 'interface';

// Optional 'NAVS' object
export const NAVS = [
  {
    route: { path: '/interface', component: InterfacePage },
    link: { path: '/interface', order: 20 }
  },
];

const FETCH_REQUEST = `${MODULE}/FETCH_REQUEST`;
const FETCH_FAILURE = `${MODULE}/FETCH_FAILURE`;
const FETCH_SUCCESS = `${MODULE}/FETCH_SUCCESS`;

const URL = '/rest-poc/v1/system/interfaces?admin_state=up;link_state=up';

// Optional 'ACTIONS' object
export const ACTIONS = {

  fetchRequest() {
    return { type: FETCH_REQUEST };
  },

  fetchFailure(url, error) {
    return { type: FETCH_FAILURE, url, error };
  },

  fetchSuccess(resp) {
    return { type: FETCH_SUCCESS, resp };
  },

  fetchIfNeeded() {
    return (dispatch, getState) => {
      if (ACTIONS.shouldFetch(getState())) {
        return dispatch(ACTIONS.fetch());
      }
    };
  },

  shouldFetch(state) {
    return state || true; // hide state warning;
  },

  fetch() {
    return dispatch => {
      dispatch(ACTIONS.fetchRequest());
      return Agent.get(URL).end((error, resp) => {
        if (error) {
          dispatch(ACTIONS.fetchFailure(URL, error));
        } else {
          dispatch(ACTIONS.fetchSuccess(resp));
        }
      });
    };
  },

};

const INITIAL_STATE = {
  isFetching: false,
  lastUpdate: 0,
  lastError: null,
  entities: {},
};

// Optional 'reducer' function
export function reducer(moduleState = INITIAL_STATE, action) {
  switch (action.type) {

    case FETCH_REQUEST:
      return { ...moduleState, isFetching: true };

    case FETCH_FAILURE:
      return { ...moduleState, isFetching: false, lastError: action.error };

    case FETCH_SUCCESS:
      const entities = {};
      const len = action.resp.body.length;
      for (let i=0; i<len; i++) {
        const item = action.resp.body[i];
        const name = item.configuration.name;
        const adminState = item.status.admin_state;
        entities[name] = { name, adminState };
      }
      return {
        ...moduleState,
        isFetching: false,
        lastUpdate: Date.now(),
        entities,
      };

    default:
      return moduleState;
  }
}
