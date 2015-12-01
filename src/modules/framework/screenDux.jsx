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
export const MODULE = 'screen';

const SCREEN_SMALL = `${MODULE}/SMALL`;
const SCREEN_MEDIUM = `${MODULE}/MEDIUM`;
const SCREEN_LARGE = `${MODULE}/LARGE`;

// Optional 'ACTIONS' object
export const ACTIONS = {
  small() { return { type: SCREEN_SMALL }; },
  medium() { return { type: SCREEN_MEDIUM }; },
  large() { return { type: SCREEN_LARGE }; },
};

const INITIAL_STATE = {
  size: 'small'
};

// Optional 'reducer' function
export function reducer(moduleState = INITIAL_STATE, action) {
  switch (action.type) {

    case SCREEN_SMALL:
      return { ...moduleState, size: 'small' };

    case SCREEN_MEDIUM:
      return { ...moduleState, size: 'medium' };

    case SCREEN_LARGE:
      return { ...moduleState, size: 'large' };

    default:
      return moduleState;
  }
}
