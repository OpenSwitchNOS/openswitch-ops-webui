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
import AsyncDux from 'asyncDux.js';
import Agent from 'agent.js';
import InterfaceCache from './interfaceCache.js';
import { TX, RX, TX_RX } from './interfaceData.js';


const NAME = 'collector';

const INITIAL_STORE = {
  interfaces: {},
  interfaceMetrics: {},
  interfaceTopMetrics: [],
  log: { entries: {}, count: 0 },
};

const AD = new AsyncDux(NAME, INITIAL_STORE);

const IC = new InterfaceCache();

const parser = (result) => {
  const product = result[0].body.status.other_info['Product Name'];
  const platform = result[0].body.status.other_info.platform_name;
  const hostname = result[1].body.configuration.hostname;

  const now = Date.now();
  const interfaces = {};
  result[2].body.forEach((elm) => {
    const status = elm.status;
    const stats = elm.statistics.statistics;
    if (status.type === 'system') {
      const id = status.name;
      const linkState = status.link_state;

      if (linkState === 'up') {
        const speed = status.link_speed ? Number(status.link_speed) : 0;
        const duplex = status.duplex;
        const rxBytes = Number(stats.rx_bytes) || 0;
        const txBytes = Number(stats.tx_bytes) || 0;

        const interfaceData = IC.getOrCreateInterface(id, speed, duplex);
        if (duplex === 'half') {
          interfaceData.updateMetric(TX_RX, rxBytes + txBytes, now);
        } else if (duplex === 'full') {
          interfaceData.updateMetric(TX, txBytes, now);
          interfaceData.updateMetric(RX, rxBytes, now);
        }

        interfaces[id] = { id, linkState, speed, duplex, rxBytes, txBytes };
      }
    }
  });

  const metrics = IC.metrics(now);
  const interfaceMetrics = metrics.all;
  const interfaceTopMetrics = metrics.top;

  const entries = {};
  let logId = 0;
  let tsMin = 0;
  let tsMax = 0;
  if (Array.isArray(result[3].body)) {
    logId = result[3].body.length;
    result[3].body.forEach(item => {
      const entry = {};
      entry.id = logId--; // reversing order
      entry.ts = Math.round(item.__REALTIME_TIMESTAMP / 1000);
      if (!tsMin || tsMin > entry.ts) { tsMin = entry.ts; }
      if (!tsMax || tsMax < entry.ts) { tsMax = entry.ts; }

      const pri = Number(item.PRIORITY);
      entry.sev =
        (pri >= 0 && pri <= 3) ? 'critical' :
          pri >= 4 && pri <= 5 ? 'warning' : 'ok';

      entry.msg = item.MESSAGE.split('|').join(', ');
      entries[entry.id] = entry;
    });
  }
  const log = { entries, count: logId - 1, tsMin, tsMax };

  return {
    product,
    platform,
    hostname,
    interfaces,
    interfaceMetrics,
    interfaceTopMetrics,
    log,
    ts: now,
  };
};

const URL_BASE = '/rest/v1/system/subsystems/base';
const URL_SYS = '/rest/v1/system';
const URL_INFS_D1 = '/rest/v1/system/interfaces?depth=1';
const URL_LOG = '/rest/v1/logs';
const URL_OFF0_L100 = `${URL_LOG}?offset=0&limit=10&priority=3`;

const AUTO_ACTIONS = {

  fetch() {
    return (dispatch) => {
      dispatch(AD.action('REQUEST', { title: t('loading') }));
      Async.parallel([
        cb => Agent.get(URL_BASE).end(cb),
        cb => Agent.get(URL_SYS).end(cb),
        cb => Agent.get(URL_INFS_D1).end(cb),
        cb => Agent.get(URL_OFF0_L100).end(cb),
      ], (error, result) => {
        if (error) { return dispatch(AD.action('FAILURE', { error })); }
        return dispatch(AD.action('SUCCESS', { result, parser } ));
      });
    };
  },

  clearError() {
    return AD.action('CLEAR_ERROR');
  },

};

export default {
  NAME,
  AUTO_ACTIONS,
  REDUCER: AD.reducer(),
};
