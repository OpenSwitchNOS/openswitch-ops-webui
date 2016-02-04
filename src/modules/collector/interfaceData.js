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
import DataPoint from 'dataPoint.js';
import Metric from 'metric.js';
import * as Calc from 'calc.js';


export const DUPLEX_HALF = 'half';
export const DUPLEX_FULL = 'full';

export const TX = 0;
export const RX = 1;
export const TX_RX = 0;

export default class InterfaceData {

  constructor(id, speed, duplex) {
    this._id = id;
    this._duplex = duplex;
    this._speed = speed;
    this._bytes = [0, 0]; // [TX or TX_RX, RX]
    this._lastUpdate = [0, 0];
    if (duplex === DUPLEX_HALF) {
      this._metrics = [ // TX_RX=0 in array
        new Metric()
          .setGroup(id)
          .setName(t('txRx'))
          .setUnits('%')
          .setColorIndex('graph-3')
      ];
    } else if (duplex === DUPLEX_FULL) {
      this._metrics = [ // TX=0, RX=1 in array
        new Metric()
          .setGroup(id)
          .setName(t('tx'))
          .setUnits('%')
          .setColorIndex('graph-3'),
        new Metric()
          .setGroup(id)
          .setName(t('rx'))
          .setUnits('%')
          .setColorIndex('graph-3'),
      ];
    }
  }

  id = () => this._id;

  duplex = () => this._duplex;

  speed = () => this._speed;

  metric = (type) => this._metrics[type]; // no copy for performance

  metrics = () => this._metrics; // no copy for performance

  isMetricStillValid(speed, duplex) {
    return this._speed === speed && this._duplex === duplex;
  }

  lastUpdate = (type) => this._lastUpdate[type];

  bytes = (type) => this._bytes[type];

  updateMetric(type, bytes, now) {
    const prevBytes = this._bytes[type];
    const lastUpdate = this._lastUpdate[type];
    const interval = now - lastUpdate;
    let metricUpdated = false;
    if (lastUpdate > 0 && interval > 0) {
      const raw = Calc.utilization(prevBytes, bytes, this._speed, interval);
      const utl = Math.round(raw);
      this._metrics[type].addDataPoint(new DataPoint(utl, now));
      metricUpdated = true;
    }
    this._bytes[type] = bytes;
    this._lastUpdate[type] = now;
    return metricUpdated;
  }

}
