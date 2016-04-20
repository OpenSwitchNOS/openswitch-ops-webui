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

import { t } from 'i18n/lookup.js';
import Async from 'async';
import AsyncDux, { cooledDown } from 'asyncDux.js';
import Agent from 'agent.js';
import EcmpPage from './ecmpPage.jsx';
import * as C from './ecmpConst.js';

const NAME = 'ecmp';

const NAVS = [
  {
    route: { path: '/ecmp', component: EcmpPage },
    link: { path: '/ecmp', order: 350 }
  },
];

const INITIAL_STORE = {};

const AD = new AsyncDux(NAME, INITIAL_STORE);

const parser = (result) => {
  const ecmp = result.body.configuration.ecmp_config;

  function norm(key) {
    return ecmp && ecmp[key] === 'false' ? 'disabled' : 'enabled';
  }

  return {
    enabled: norm(C.ECMP_ENABLED),
    hashDstIp: norm(C.DST_IP_ENABLED),
    hashDstPort: norm(C.DST_PORT_ENABLED),
    hashSrcIp: norm(C.SRC_IP_ENABLED),
    hashSrcPort: norm(C.SRC_PORT_ENABLED),
    resilientHash: norm(C.RESILIENT_HAS_ENABLED),
  };
};

const URL_SYS = '/rest/v1/system';

const ACTIONS = {

  fetch() {
    return (dispatch, getStoreFn) => {
      const mStore = getStoreFn()[NAME];
      if (cooledDown(mStore, Date.now())) {
        dispatch(AD.action('REQUEST', { title: t('loading') }));
        Agent.get(URL_SYS).end((error, result) => {
          if (error) { return dispatch(AD.action('FAILURE', { error })); }
          return dispatch(AD.action('SUCCESS', { result, parser }));
        });
      }
    };
  },

  editEcmp(ecmpDataObj) {
    const ecmpEnabled = (ecmpDataObj.enabled === 'enabled').toString();
    const resilientHash = (ecmpDataObj.resilientHash === 'enabled').toString();
    const hashDstPort = (ecmpDataObj.hashDstPort === 'enabled').toString();
    const hashDstIp = (ecmpDataObj.hashDstIp === 'enabled').toString();
    const hashSrcIp = (ecmpDataObj.hashSrcIp === 'enabled').toString();
    const hashSrcPort = (ecmpDataObj.hashSrcPort === 'enabled').toString();

    return dispatch => {
      dispatch(AD.action('REQUEST', { title: t('deploying'), numSteps: 2 }));
      Async.series([
        cb => {
          dispatch(AD.action('REQUEST_STEP', { currStep: 1 }));
          Agent.patch(URL_SYS).send([{
            'op': 'add',
            'path': '/ecmp_config',
            'value': {
              [C.ECMP_ENABLED]: ecmpEnabled,
              [C.RESILIENT_HAS_ENABLED]: resilientHash,
              [C.DST_IP_ENABLED]: hashDstIp,
              [C.DST_PORT_ENABLED]: hashDstPort,
              [C.SRC_IP_ENABLED]: hashSrcIp,
              [C.SRC_PORT_ENABLED]: hashSrcPort
            }
          }]).end(cb);
        },
        cb => {
          dispatch(AD.action('REQUEST_STEP', { currStep: 2 }));
          Agent.get(URL_SYS).end(cb);
        },
      ], (error, result) => {
        if (error) { return dispatch(AD.action('FAILURE', { error })); }
        return dispatch(AD.action('SUCCESS', { result: result[1], parser }));
      });
    };
  },

  clearError() {
    return AD.action('CLEAR_ERROR');
  },

};

export default {
  NAME,
  NAVS,
  ACTIONS,
  REDUCER: AD.reducer(),
};
