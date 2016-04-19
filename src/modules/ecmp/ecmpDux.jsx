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
import AsyncDux, { cooledDown } from 'asyncDux.js';
import Agent from 'agent.js';
import EcmpPage from './ecmpPage.jsx';

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
    enabled: norm('enabled'),
    hashDstIp: norm('hash_dstip_enabled'),
    hashDstPort: norm('hash_dstport_enabled'),
    hashSrcIp: norm('hash_srcip_enabled'),
    hashSrcPort: norm('hash_srcport_enabled'),
    resilientHash: norm('resilient_hash_enabled'),
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
      dispatch(AD.action('REQUEST'));
      Agent.patch('/rest/v1/system').send([
        {'op': 'add', 'path': '/ecmp_config', 'value': {enabled: ecmpEnabled, 'resilient_hash_enabled': resilientHash, 'hash_dstip_enabled': hashDstIp, 'hash_dstport_enabled': hashDstPort, 'hash_srcip_enabled': hashSrcIp, 'hash_srcport_enabled': hashSrcPort}}]).end((error) => {
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
  NAVS,
  ACTIONS,
  REDUCER: AD.reducer(),
};
