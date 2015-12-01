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

import InterfaceRouteContainer from './interfaceRouteContainer.jsx';
import Agent from 'superagent';

// Required 'MODULE' name
export const MODULE = 'interface';

// Optional 'NAVS' object
export const NAVS = [
  {
    route: { path: '/interface', component: InterfaceRouteContainer },
    link: { path: '/interface', order: 6 }
  },
];

const INTERFACES_FETCH_REQUEST = `${MODULE}/FETCH_REQUEST`;
const INTERFACES_FETCH_FAILURE = `${MODULE}/FETCH_FAILURE`;
const INTERFACES_FETCH_SUCCESS = `${MODULE}/FETCH_SUCCESS`;

// FIXME const URL
const URL = 'http://15.108.30.248:8091/rest-poc/v1/system/interfaces?admin_state=up;link_state=up';

// Optional 'ACTIONS' object
export const ACTIONS = {

  fetchRequest() {
    return { type: INTERFACES_FETCH_REQUEST };
  },

  fetchFailure(url, error) {
    return { type: INTERFACES_FETCH_FAILURE, url, error };
  },

  fetchSuccess(resp) {
    return { type: INTERFACES_FETCH_SUCCESS, resp };
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

    case INTERFACES_FETCH_REQUEST:
      return { ...moduleState, isFetching: true };

    case INTERFACES_FETCH_FAILURE:
      return { ...moduleState, isFetching: false, lastError: action.error };

    case INTERFACES_FETCH_SUCCESS:
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
