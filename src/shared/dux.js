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

/*eslint no-console:0*/

import Agent, { mkAgentHandler } from 'agent.js';
import Async from 'async';


const FETCH_INITIAL_STORE = {
  isFetching: false,
  lastUpdate: 0,
  lastError: null,
};

function fetchActionTypes(moduleName) {
  return {
    REQUEST: `${moduleName}/FETCH_REQUEST`,
    SUCCESS: `${moduleName}/FETCH_SUCCESS`,
    FAILURE: `${moduleName}/FETCH_FAILURE`,
  };
}

function protectedParse(moduleName, moduleParseFn, result) {
  try {
    return moduleParseFn(result);
  } catch (e) {
    console.log(`DUX parsing failure in: ${moduleName}`);
    console.log(`Exception message: ${e.message}`);
  }
  return {};
}

function fetchReducer(moduleName, moduleInitialStore, moduleParseFn) {
  const ACTION_TYPES = fetchActionTypes(moduleName);
  const INITIAL_STORE = { ...FETCH_INITIAL_STORE, ...moduleInitialStore };

  return (moduleStore = INITIAL_STORE, action) => {
    switch (action.type) {

      case ACTION_TYPES.REQUEST:
        return {
          ...moduleStore,
          isFetching: true
        };

      case ACTION_TYPES.FAILURE:
        return {
          ...moduleStore,
          isFetching: false,
          lastError: action.error
        };

      case ACTION_TYPES.SUCCESS:
        const fetchedStore =
          protectedParse(moduleName, moduleParseFn, action.result);

        return {
          ...moduleStore,
          isFetching: false,
          lastError: null,
          lastUpdate: Date.now(),
          ...fetchedStore,
        };

      default:
        return moduleStore;
    }
  };
}

const DEBOUNCE_INTERVAL = 3000;

function isReadyToFetch(store, now) {
  return !store.isFetching && (now - store.lastUpdate) > DEBOUNCE_INTERVAL;
}

function performFetch(actionTypes, dispatch, urls) {
  dispatch({ type: actionTypes.REQUEST });

  function dispatcher(error, result) {
    if (error) {
      dispatch({ type: actionTypes.FAILURE, error });
    } else {
      dispatch({ type: actionTypes.SUCCESS, result });
    }
  }

  if (Array.isArray(urls)) {
    const gets = [];
    urls.forEach(url => {
      gets.push(cb => Agent.get(url).end(mkAgentHandler(url, cb)));
    });
    Async.parallel(gets, dispatcher);

  } else {
    const url = urls;
    Agent.get(url).end(mkAgentHandler(url, dispatcher));
  }
}

function fetchAction(moduleName, urls) {
  const ACTION_TYPES = fetchActionTypes(moduleName);

  return (dispatch, getStoreFn) => {
    const store = getStoreFn()[moduleName];
    if (isReadyToFetch(store, Date.now())) {
      performFetch(ACTION_TYPES, dispatch, urls);
    }
  };
}

export default {
  fetchActionTypes,
  fetchAction,
  fetchReducer,

  isReadyToFetch,
  protectedParse,
  performFetch,
};
