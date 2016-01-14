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

import SyslogPage from './syslogPage.jsx';

// Required 'MODULE' name
export const MODULE = 'syslog';

// Optional 'NAVS' object
export const NAVS = [
  {
    route: { path: '/syslog', component: SyslogPage },
    link: { path: '/syslog', order: 10 }
  },
];

const FETCH_REQUEST = `${MODULE}/FETCH_REQUEST`;
const FETCH_FAILURE = `${MODULE}/FETCH_FAILURE`;
const FETCH_SUCCESS = `${MODULE}/FETCH_SUCCESS`;
const READ_ALERT = `${MODULE}/READ_ALERT`;
const READ_ERROR = `${MODULE}/READ_ERROR`;
const READ_WARNING = `${MODULE}/READ_WARNING`;
const READ_ALL = `${MODULE}/READ_ALL`;

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
      dispatch(ACTIONS.fetchSuccess({}));
    };
  },

  readAlert() {
    return { type: READ_ALERT };
  },

  readError() {
    return { type: READ_ERROR };
  },

  readWarning() {
    return { type: READ_WARNING };
  },

  readAll() {
    return { type: READ_ALL };
  }
};

const INITIAL_STATE = {
  isFetching: false,
  lastUpdate: 0,
  lastError: null,
  entities: {},
  lastRead: 0,
  numUnread: 0,
};

const syslogData = {
  '1': {
    severity: 1,
    date: '2015-12-17 01:01:01',
    facility: 'Auth',
    text: 'This is Alert syslog with Severity: 1'
  },
  '2': {
    severity: 3,
    date: '2015-12-17 02:02:02',
    facility: 'System',
    text: 'This is Error syslog with Severity: 3'
  },
  '3': {
    severity: 4,
    date: '2015-12-17 03:03:03',
    facility: 'LAG',
    text: 'This is Warning syslog with Severity: 4'
  },
  '4': {
    severity: 5,
    date: '2015-12-17 04:04:04',
    facility: 'LLDP',
    text: 'This is Info syslog with Severity: 5'
  }
};

// Optional 'reducer' function
export function reducer(moduleState = INITIAL_STATE, action) {
  switch (action.type) {

    case FETCH_REQUEST:
      return { ...moduleState, isFetching: true };

    case FETCH_FAILURE:
      return { ...moduleState, isFetching: false, lastError: action.error };

    case FETCH_SUCCESS:
      let entities = syslogData;
      return {
        ...moduleState,
        isFetching: false,
        lastUpdate: Date.now(),
        entities,
        numUnread: 4,
      };

    case READ_ALERT:
      entities = {
        '1': {
          severity: 1,
          date: '2015-12-17 01:01:01',
          facility: 'Auth',
          text: 'This is Alert syslog with Severity: 1'
        }
      };
      return { ...moduleState, entities, lastRead: Date.now(), numUnread: 0 };

    case READ_ERROR:
      entities = {
        '1': {
          severity: 3,
          date: '2015-12-17 02:02:02',
          facility: 'System',
          text: 'This is Error syslog with Severity: 3'
        }
      };
      return { ...moduleState, entities, lastRead: Date.now(), numUnread: 0 };

    case READ_WARNING:
      entities = {
        '1': {
          severity: 4,
          date: '2015-12-17 03:03:03',
          facility: 'LAG',
          text: 'This is Warning syslog with Severity: 4'
        }
      };
      return { ...moduleState, entities, lastRead: Date.now(), numUnread: 0 };

    case READ_ALL:
      entities = syslogData;
      return { ...moduleState, entities, lastRead: Date.now(), numUnread: 0 };

    default:
      return moduleState;
  }
}
