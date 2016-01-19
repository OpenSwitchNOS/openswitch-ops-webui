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
import { t } from 'i18n/lookup.js';
import Agent, { parseError } from 'agent.js';

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
const FETCH_CRITICAL = `${MODULE}/FETCH_CRITICAL`;
const FETCH_WARNING = `${MODULE}/FETCH_WARNING`;
const FETCH_ALL = `${MODULE}/FETCH_ALL`;

const local = true; // To get fake data avoding REST call
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

function fetchLocal(severity) {
  let entities = new Object();
  let idx = 1;
  switch (severity) {
    case t('critical'):
      for (const key in syslogData) {
        if (syslogData[key].severity >=0 && syslogData[key].severity <=3) {
          entities[idx++] = syslogData[key];
        }
      }
      break;
    case t('warning'):
      for (const key in syslogData) {
        if (syslogData[key].severity >=4 && syslogData[key].severity <=5) {
          entities[idx++] = syslogData[key];
        }
      }
      break;
    case 3:
    default:
      entities = syslogData;
      break;
  }
  return entities;
}

// Optional 'ACTIONS' object
export const ACTIONS = {
  fetchRequest(severity) {
    let action;
    switch (severity) {
      case t('critical'):
        action = FETCH_CRITICAL;
        break;
      case t('warning'):
        action = FETCH_WARNING;
        break;
      default:
        action = FETCH_ALL;
        break;
    }
    return { type: action };
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

  fetch(severity) {
    return dispatch => {
      if (local) {
        const data = fetchLocal(severity);
        dispatch(ACTIONS.fetchSuccess(data));
      } else {
        Agent.get(URL).end((error, resp) => {
          if (error) {
            dispatch({ type: FETCH_FAILURE, error: parseError(URL, error)});
          } else {
            dispatch({ type: FETCH_SUCCESS, resp });
          }
        });
      }
    };
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

// Optional 'reducer' function
export function reducer(moduleState = INITIAL_STATE, action) {
  switch (action.type) {
    case FETCH_REQUEST:
      return { ...moduleState, isFetching: true };

    case FETCH_FAILURE:
      return { ...moduleState, isFetching: false, lastError: action.error };

    case FETCH_SUCCESS:
      let entities;
      if (local) {
        entities = action.resp;
      } else {
        entities = action.resp.body;
      }
      return {
        ...moduleState,
        isFetching: false,
        lastUpdate: Date.now(),
        entities,
        numUnread: 8, // need function to get length from entities
      };

    default:
      return moduleState;
  }
}
