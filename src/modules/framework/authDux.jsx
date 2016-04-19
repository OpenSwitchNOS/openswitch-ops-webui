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

import Agent from 'agent.js';
import AsyncDux from 'asyncDux.js';

const NAME = 'auth';

const INITIAL_STORE = {
  isLoggedIn: false,
};

const AD = new AsyncDux(NAME, INITIAL_STORE);

const ACTIONS = {

  login(data) {
    const { username, password } = data;
    const send = `username=${username}&password=${password}`;

    return dispatch => {
      dispatch(AD.action('REQUEST'));
      Agent.post('/login').send(send).end((error) => {
        if (error) { return dispatch(AD.action('FAILURE', { error })); }
        return dispatch(AD.action('SUCCESS', {
          parser: () => { return { username, isLoggedIn: true }; }
        }));
      });
    };
  },

  logout() {
    return dispatch => {
      dispatch(AD.action('REQUEST'));
      return dispatch(AD.action('SUCCESS', {
        parser: () => { return { username: null, isLoggedIn: false }; }
      }));
    };

  },

  changePassword(changePw) {
    const OLDPW = changePw.oldPw;
    const NEWPW = changePw.newPw;
    return dispatch => {
      dispatch(AD.action('REQUEST'));
      Agent.put('/account').send({configuration: {password: OLDPW, 'new_password': NEWPW}}).end((error) => {
        if (error) { return dispatch(AD.action('FAILURE', { error })); }
        return dispatch(AD.action('SUCCESS', {
          parser: () => { return { 'SUCCESS': true }; }
        }));
      });
    };
  },

  clearError() {
    return AD.action('CLEAR_ERROR');
  },
};

export default {
  NAME,
  ACTIONS,
  REDUCER: AD.reducer(),
};
