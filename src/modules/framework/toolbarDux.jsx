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

// Required 'MODULE' name
export const MODULE = 'toolbar';

const CLEAR = `${MODULE}/CLEAR`;
const SET = `${MODULE}/SET`;

// Optional 'ACTIONS' object
export const ACTIONS = {
  clear() { return { type: CLEAR }; },
  set(component) { return { type: SET, component }; },
};

const INITIAL_STATE = {
  component: null,
};

// Optional 'reducer' function
export function reducer(moduleState = INITIAL_STATE, action) {
  switch (action.type) {

    case CLEAR:
      return { ...INITIAL_STATE };

    case SET:
      return { component: action.component };

    default:
      return moduleState;
  }
}
