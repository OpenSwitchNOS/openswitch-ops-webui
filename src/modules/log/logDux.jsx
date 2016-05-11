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
import Agent from 'agent.js';
import AsyncDux from 'asyncDux.js';
import LogPage from './logPage.jsx';
import * as Time from 'time.js';


const NAME = 'log';

const NAVS = [
  {
    route: { path: '/log', component: LogPage },
    link: { path: '/log', order: 450 }
  },
];

const INITIAL_STORE = {
  entries: {},
};

const LIMIT = 1000;

const AD = new AsyncDux(NAME, INITIAL_STORE);

const parser = (result) => {
  const entries = {};
  if (!Array.isArray(result.body)) {
    return { entries };
  }
  let id = result.body.length;
  result.body.forEach(item => {
    const entry = {};
    entry.id = id--;
    entry.ts = Time.toTimestamp(Math.round(item.__REALTIME_TIMESTAMP / 1000));

    const pri = Number(item.PRIORITY);
    entry.sev =
      (pri >= 0 && pri <= 3) ? 'critical' :
        pri === 4 ? 'warning' : 'ok';

    entry.syslogId = item.SYSLOG_IDENTIFIER;
    entry.cat = item.MESSAGE_ID;
    entry.msg = item.MESSAGE.split('|').join(', '); // more readable
    entries[entry.id] = entry;
  });
  return { entries, limit: LIMIT };
};

const URL = '/rest/v1/logs';
const URL_OFF0_L = `${URL}?offset=0&limit=${LIMIT}`;

function mkUrl(filter) {
  const f = filter;
  return `${URL_OFF0_L}&priority=${f.priority}&since=${f.since}`;
}

const ACTIONS = {

  fetch(filter) {
    const url = mkUrl(filter);
    return (dispatch) => {
      dispatch(AD.action('REQUEST', { title: t('loading') }));
      Agent.get(url).end((error, result) => {
        if (error) { return dispatch(AD.action('FAILURE', { error })); }
        return dispatch(AD.action('SUCCESS', { result, parser }));
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
