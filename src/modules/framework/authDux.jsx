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

const NAME = 'auth';
const LOGIN = `${NAME}/LOGIN`;
const LOGOUT = `${NAME}/LOGOUT`;

const ACTIONS = {
  login() { return { type: LOGIN }; },
  logout() { return { type: LOGOUT }; },
};

const INITIAL_STORE = {
  isLoggedIn: false
};

function REDUCER(moduleStore = INITIAL_STORE, action) {
  switch (action.type) {

    case LOGIN:
      return { ...moduleStore, isLoggedIn: true };

    case LOGOUT:
      return { ...moduleStore, isLoggedIn: false };

    default:
      return moduleStore;
  }
}

export default {
  NAME,
  ACTIONS,
  REDUCER,
};
