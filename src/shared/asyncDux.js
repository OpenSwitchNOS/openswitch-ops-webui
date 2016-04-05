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

const TYPES = [
  'REQUEST',
  'REQUEST_STEP',
  'SUCCESS',
  'FAILURE',
  'CLEAR_ERROR'
];

export const DEFAULT_STATUS = {
  title: '',
  inProgress: false,
  lastSuccessMillis: 0,
  lastError: null,
  numSteps: 0,
  currStep: 0,
  currStepMsg: '',
};

const COOLDOWN_MILLIS = 5000;

export function cooledDown(moduleStore, now) {
  const { inProgress, lastSuccessMillis } = moduleStore.asyncStatus;
  return !inProgress && (now - lastSuccessMillis) > COOLDOWN_MILLIS;
}

export function mkActionTypes(moduleName) {
  const at = {};
  TYPES.forEach(t => at[t] = `${moduleName}/${t}`);
  return at;
}

export function protectedFn(moduleName, fn, result) {
  try {
    return fn(result);
  } catch (e) {
    console.log(`DUX failure in: ${moduleName}`);
    if (!window.jasmine) {
      console.log(`Exception message: ${e.message}`, e.stack);
    }
  }
  return {};
}

export function mkReducer(moduleName, initialStore, at) {
  return (moduleStore = initialStore, action) => {
    switch (action.type) {

      case at.REQUEST: {
        const asyncStatus = { ...moduleStore.asyncStatus };

        asyncStatus.title = action.title || '';
        asyncStatus.inProgress = true;
        asyncStatus.numSteps = action.numSteps || 1;
        asyncStatus.currStep = 1;
        asyncStatus.currStepMsg = action.currStepMsg || '';

        return { ...moduleStore, asyncStatus };
      }

      case at.REQUEST_STEP: {
        const asyncStatus = { ...moduleStore.asyncStatus };

        asyncStatus.currStep = action.currStep;
        asyncStatus.currStepMsg = action.currStepMsg || '';

        return { ...moduleStore, asyncStatus };
      }

      case at.FAILURE: {
        const asyncStatus = { ...moduleStore.asyncStatus };

        asyncStatus.lastError = action.error;
        asyncStatus.inProgress = false;

        return { ...moduleStore, asyncStatus };
      }

      case at.CLEAR_ERROR: {
        const asyncStatus = { ...moduleStore.asyncStatus };

        asyncStatus.lastError = null;

        return { ...moduleStore, asyncStatus };
      }

      case at.SUCCESS: {
        const asyncStatus = { ...moduleStore.asyncStatus };

        const fn = action.parser;
        const data = fn ? protectedFn(moduleName, fn, action.result) : {};

        asyncStatus.inProgress = false;
        asyncStatus.lastError = null;
        asyncStatus.lastSuccessMillis = Date.now();
        asyncStatus.numSteps = 0;
        asyncStatus.currStep = 0;
        asyncStatus.currStepMsg = '';

        return { ...moduleStore, ...data, asyncStatus };
      }
    }
    return moduleStore;
  };
}


export default class AsyncDux {

  constructor(moduleName, initialStore) {
    this._moduleName = moduleName;
    this._actionTypes = mkActionTypes(moduleName);
    const is = { ...initialStore, asyncStatus: { ...DEFAULT_STATUS } };
    this._reducer = mkReducer(moduleName, is, this._actionTypes);
  }

  action(typeKey, data) {
    const type = this._actionTypes[typeKey];
    if (data) { return { type, ...data }; }
    return { type };
  }

  reducer() { return this._reducer; }
}
