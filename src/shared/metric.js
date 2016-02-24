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

export default class Metric {

  static CACHE_SIZE = 6;

  constructor(cacheSize) {
    this._cacheSize = cacheSize || Metric.CACHE_SIZE;
    this._colorIndex = '';
    this._group = '';
    this._name = '';
    this._units = '';
    this._dataPoints = [];
    this._min = 0;
    this._warning = 75;
    this._critical = 90;
    this._max = 100;
  }

  cacheSize() { return this._cacheSize; }

  setColorIndex(colorIndex) { this._colorIndex = colorIndex; return this; }
  getColorIndex() { return this._colorIndex; }

  setName(name) { this._name = name; return this; }
  getName() { return this._name; }

  setGroup(group) { this._group = group; return this; }
  getGroup() { return this._group; }

  setUnits(units) { this._units = units; return this; }
  getUnits() { return this._units; }

  getDataPoints() {return this._dataPoints.slice(); }

  setDataPoints(dataPoints) {
    if (!dataPoints) {
      this._dataPoints = [];
    } else {
      const len = dataPoints.length;
      if (len > this._cacheSize) {
        this._dataPoints = dataPoints.slice(len - this._cacheSize, len);
      } else {
        this._dataPoints = dataPoints.slice();
      }
    }
    return this;
  }

  addDataPoint(dataPoint) {
    if (this._dataPoints.length >= this._cacheSize) {
      this._dataPoints.shift();
    }
    this._dataPoints.push(dataPoint);
    return this;
  }

  getDataPoint(i) { return this._dataPoints[i]; }

  latestDataPoint() { return this._dataPoints[this._dataPoints.length - 1]; }

  latestValueUnits() {
    const dp = this.latestDataPoint();
    return dp ? `${dp.value()} ${this.getUnits()}` : '';
  }

  latestValueColorIndex() {
    const dp = this.latestDataPoint();
    if (dp) {
      if (dp.value() >= this._critical) {
        return 'critical';
      }
      if (dp.value() >= this._warning) {
        return 'warning';
      }
    }
    return 'ok';
  }

  size() { return this._dataPoints.length; }

  min() { return this._min; }
  max() { return this._max; }
  warning() { return this._warning; }
  critical() { return this._critical; }

  setThresholds(min, max, warning, critical) {
    const w = warning || max * 0.75;
    const c = critical || max * 0.9;
    if (min < w && w < c && c < max) {
      this._min = min;
      this._max = max;
      this._warning = w;
      this._critical = c;
    }
    return this;
  }

}
