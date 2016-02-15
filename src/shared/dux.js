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


const DEFAULT_INITIAL_STORE = {
  fetch: {
    inProgress: false,
    lastSuccessMillis: 0,
    lastError: null,
  },
  set: {
    inProgress: false,
    lastSuccessMillis: 0,
    lastError: null,
  }
};

function actionTypes(moduleName) {
  return {
    FETCH_REQUEST: `${moduleName}/FETCH_REQUEST`,
    FETCH_SUCCESS: `${moduleName}/FETCH_SUCCESS`,
    FETCH_FAILURE: `${moduleName}/FETCH_FAILURE`,
    FETCH_CLEAR_ERROR: `${moduleName}/FETCH_CLEAR_ERROR`,
    SET_REQUEST: `${moduleName}/SET_REQUEST`,
    SET_SUCCESS: `${moduleName}/SET_SUCCESS`,
    SET_FAILURE: `${moduleName}/SET_FAILURE`,
    SET_CLEAR_ERROR: `${moduleName}/SET_CLEAR_ERROR`,
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

function reducer(moduleName, moduleInitialStore, moduleParseFn) {
  const ACTION_TYPES = actionTypes(moduleName);
  const INITIAL_STORE = { ...DEFAULT_INITIAL_STORE, ...moduleInitialStore };

  return (moduleStore = INITIAL_STORE, action) => {
    switch (action.type) {

      case ACTION_TYPES.SET_CLEAR_ERROR: {
        const set = { ...moduleStore.set, lastError: null };
        return { ...moduleStore, set };
      }

      case ACTION_TYPES.FETCH_CLEAR_ERROR: {
        const fetch = { ...moduleStore.fetch, lastError: null };
        return { ...moduleStore, fetch };
      }

      case ACTION_TYPES.SET_REQUEST: {
        const set = { ...moduleStore.set, inProgress: true };
        return { ...moduleStore, set };
      }

      case ACTION_TYPES.FETCH_REQUEST: {
        const fetch = { ...moduleStore.fetch, inProgress: true };
        return { ...moduleStore, fetch };
      }

      case ACTION_TYPES.SET_FAILURE: {
        const set = {
          ...moduleStore.set,
          inProgress: false,
          lastError: action.error
        };
        return { ...moduleStore, set };
      }

      case ACTION_TYPES.FETCH_FAILURE: {
        const fetch = {
          ...moduleStore.fetch,
          inProgress: false,
          lastError: action.error
        };
        return { ...moduleStore, fetch };
      }

      case ACTION_TYPES.SET_SUCCESS: {
        const set = {
          ...moduleStore.set,
          inProgress: false,
          lastError: null,
          lastSuccessMillis: Date.now()
        };
        return { ...moduleStore, set };
      }

      case ACTION_TYPES.FETCH_SUCCESS: {
        const fetchedStore =
          protectedParse(moduleName, moduleParseFn, action.result);
        const fetch = {
          ...moduleStore.fetch,
          inProgress: false,
          lastError: null,
          lastSuccessMillis: Date.now()
        };
        return { ...moduleStore, fetch, ...fetchedStore };
      }

      default:
        return moduleStore;
    }
  };
}

const DEBOUNCE_INTERVAL = 3000;

function isReadyToFetch(store, now) {
  const { inProgress, lastSuccessMillis } = store.fetch;
  return !inProgress && (now - lastSuccessMillis) > DEBOUNCE_INTERVAL;
}

function performFetch(at, dispatch, urls) {
  dispatch({ type: at.FETCH_REQUEST });

  function dispatcher(error, result) {
    if (error) {
      dispatch({ type: at.FETCH_FAILURE, error });
    } else {
      dispatch({ type: at.FETCH_SUCCESS, result });
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
  const ACTION_TYPES = actionTypes(moduleName);

  return (dispatch, getStoreFn) => {
    const store = getStoreFn()[moduleName];
    if (isReadyToFetch(store, Date.now())) {
      performFetch(ACTION_TYPES, dispatch, urls);
    }
  };
}

export default {
  actionTypes,
  fetchAction,
  reducer,
  isReadyToFetch,
  protectedParse,
  performFetch,
};
