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
export const MODULE = 'nav';

const SHOW_PANE = `${MODULE}/SHOW_PANE`;
const HIDE_PANE = `${MODULE}/HIDE_PANE`;

// Optional 'ACTIONS' object
export const ACTIONS = {
  showPane() { return { type: SHOW_PANE }; },
  hidePane() { return { type: HIDE_PANE }; },
};

const INITIAL_STATE = {
  paneActive: false
};

// Optional 'reducer' function
export function reducer(moduleState = INITIAL_STATE, action) {
  switch (action.type) {

    case SHOW_PANE:
      return { ...moduleState, paneActive: true };

    case HIDE_PANE:
      return { ...moduleState, paneActive: false };

    default:
      return moduleState;
  }
}
