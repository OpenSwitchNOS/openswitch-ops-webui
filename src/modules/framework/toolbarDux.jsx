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

import React from 'react';
import FetchToolbar from 'fetchToolbar.jsx';


const NAME = 'toolbar';
const CLEAR = `${NAME}/CLEAR`;
const SET = `${NAME}/SET`;

const ACTIONS = {
  clear() { return { type: CLEAR }; },
  set(component) { return { type: SET, component }; },
  setFetchTB(asyncStatus, onRefresh, spin) {
    if (!asyncStatus) {
      throw new Error('invalid async object set on toolbar');
    }
    return {
      type: SET,
      component: (
        <FetchToolbar
            isFetching={asyncStatus.inProgress}
            spin={spin}
            date={asyncStatus.lastSuccessMillis}
            onRefresh={onRefresh}/>
      )
    };
  }
};

const INITIAL_STORE = {
  component: null,
};

function REDUCER(moduleStore = INITIAL_STORE, action) {
  switch (action.type) {

    case CLEAR:
      if (moduleStore.component) {
        // TODO: need to invesigate why this is casing infinity loop sometimes.
        return { ...INITIAL_STORE };
      }
      return moduleStore;

    case SET:
      return { component: action.component };

    default:
      return moduleStore;
  }
}

export default {
  NAME,
  ACTIONS,
  REDUCER,
};
