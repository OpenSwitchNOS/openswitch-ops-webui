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

const ASYNC_TYPES = [
  'REQUEST',
  'REQUEST_STEP',
  'SUCCESS',
  'FAILURE',
  'CLEAR_ERROR'
];

function mkAsyncStore() {
  return {
    inProgress: false,
    lastSuccessMillis: 0,
    lastError: null,
    numSteps: 0,
    currStep: 0,
    currStepMsg: '',
  };
}

function mkAsyncActionTypes(moduleName, asyncName) {
  const at = {};
  ASYNC_TYPES.forEach(t => {
    at[t] = `${moduleName}/${asyncName}/${t}`;
  });
  return at;
}

function protectedFn(moduleName, asyncName, fn, result) {
  try {
    return fn(result);
  } catch (e) {
    console.log(`DUX failure in: ${moduleName}/${asyncName}`);
    if (!window.jasmine) {
      console.log(`Exception message: ${e.message}`, e.stack);
    }
  }
  return {};
}

function mkAsyncHandler(moduleName, asyncName, asyncAts, parseFn) {
  return (moduleStore, action) => {
    switch (action.type) {

      case asyncAts.REQUEST: {
        const numSteps = action && action.numSteps || 1;
        const currStepMsg = action && action.currStepMsg || '';
        const asyncStore = {
          ...moduleStore[asyncName],
          inProgress: true,
          numSteps,
          currStep: 1,
          currStepMsg,
        };
        return { ...moduleStore, [asyncName]: asyncStore };
      }

      case asyncAts.REQUEST_STEP: {
        const currStep = action.currStep;
        const currStepMsg = action.currStepMsg || '';
        const asyncStore = {
          ...moduleStore[asyncName],
          currStep,
          currStepMsg,
        };
        return { ...moduleStore, [asyncName]: asyncStore };
      }

      case asyncAts.FAILURE: {
        const asyncStore = {
          ...moduleStore[asyncName],
          lastError: action.error,
          inProgress: false,
          numSteps: 0,
          currStep: 0,
          currStepMsg: '',
        };
        return { ...moduleStore, [asyncName]: asyncStore };
      }

      case asyncAts.CLEAR_ERROR: {
        const asyncStore = {
          ...moduleStore[asyncName],
          lastError: null
        };
        return { ...moduleStore, [asyncName]: asyncStore };
      }

      case asyncAts.SUCCESS: {
        const newAsyncStore = parseFn
          ? protectedFn(moduleName, asyncName, parseFn, action.result)
          : {};
        const asyncStore = {
          ...moduleStore[asyncName],
          inProgress: false,
          lastError: null,
          lastSuccessMillis: Date.now(),
          numSteps: 0,
          currStep: 0,
          currStepMsg: '',
          ...newAsyncStore,
        };
        return { ...moduleStore, [asyncName]: asyncStore };
      }
    }
    return null;
  };
}

function mkReducer(initialStore, asyncHandlers) {
  return (moduleStore = initialStore, action) => {
    for (let i=0; i<asyncHandlers.length; i++) {
      const newModuleStore = asyncHandlers[i](moduleStore, action);
      if (newModuleStore) {
        return newModuleStore;
      }
    }
    return moduleStore;
  };
}

function actionRequest(at, numSteps, currStepMsg) {
  const obj = { type: at.REQUEST };
  if (numSteps) {
    const action = { numSteps };
    if (currStepMsg) { action.currStepMsg = currStepMsg; }
    obj.action = action;
  }
  return obj;
}

function actionRequestStep(at, currStep, currStepMsg) {
  const action = { currStep };
  if (currStepMsg) { action.currStepMsg = currStepMsg; }
  return { type: at.REQUEST_STEP, action };
}

function actionFail(at, error) { return { type: at.FAILURE, error }; }
function actionSuccess(at, result) { return { type: at.SUCCESS, result }; }
function actionClearError(at) { return { type: at.CLEAR_ERROR }; }

function dispatchRequest(dispatch, at) {
  dispatch(actionRequest(at));
}

function dispatchFail(dispatch, at, error) {
  dispatch(actionFail(at, error));
}

function dispatchSuccess(dispatch, at, result) {
  dispatch(actionSuccess(at, result));
}

function mkAsyncDispatcher(dispatch, at) {
  return (error, result) => {
    if (error) {
      return dispatchFail(dispatch, at, error);
    }
    dispatchSuccess(dispatch, at, result);
  };
}

const ASYNC_COOLDOWN_MILLIS = 5000;

function waitForCooldown(moduleStore, asyncName, now) {
  const { inProgress, lastSuccessMillis } = moduleStore[asyncName];
  return !inProgress && (now - lastSuccessMillis) > ASYNC_COOLDOWN_MILLIS;
}

function get(dispatch, at, urls) {
  dispatchRequest(dispatch, at);
  const dispatcher = mkAsyncDispatcher(dispatch, at);
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

function getIfCooledDown(dispatch, moduleStore, asyncName, at, urls) {
  if (waitForCooldown(moduleStore, asyncName, Date.now())) {
    get(dispatch, at, urls);
  }
}

export default {
  mkAsyncStore,
  mkAsyncActionTypes,
  protectedFn,
  mkAsyncHandler,
  mkReducer,
  actionRequest,
  actionRequestStep,
  actionFail,
  actionSuccess,
  actionClearError,
  dispatchRequest,
  dispatchFail,
  dispatchSuccess,
  mkAsyncDispatcher,
  waitForCooldown,
  get,
  getIfCooledDown,
};
