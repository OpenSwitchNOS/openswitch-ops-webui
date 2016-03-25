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
};

const AD = new AsyncDux(NAME, INITIAL_STORE);

const IC = new InterfaceCache();

const parser = (result) => {
  const product = result[0].body.status.other_info['Product Name'];
  const hostname = result[1].body.configuration.hostname;

  const now = Date.now();
  const interfaces = {};
  result[2].body.forEach((elm) => {
    const cfg = elm.configuration;
    const status = elm.status;
    const stats = elm.statistics.statistics;
    if (cfg.type === 'system') {
      const id = cfg.name;
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

  return {
    product, hostname, interfaces, interfaceMetrics, interfaceTopMetrics
  };
};

const URL_BASE = '/rest/v1/system/subsystems/base';
const URL_SYS = '/rest/v1/system';
const URL_INFS_D1 = '/rest/v1/system/interfaces?depth=1';

const AUTO_ACTIONS = {

  fetch() {
    return (dispatch) => {
      dispatch(AD.action('REQUEST'));
      Async.parallel([
        cb => Agent.get(URL_BASE).end(cb),
        cb => Agent.get(URL_SYS).end(cb),
        cb => Agent.get(URL_INFS_D1).end(cb),
      ], (error, result) => {
        if (error) { return dispatch(AD.action('FAILURE', { error })); }
        return dispatch(AD.action('SUCCESS', { result, parser } ));
      });
    };
  },

};

export default {
  NAME,
  AUTO_ACTIONS,
  REDUCER: AD.reducer(),
};
