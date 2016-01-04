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

  static CACHE_SIZE = 60;

  constructor(name, units, values, min, max, warning, critical, cacheSize) {
    this._cacheSize = cacheSize || Metric.CACHE_SIZE;
    this._name = name || '';
    this._units = units || '';
    this.setValues(values);
    this._min = min || 0;
    this._max = (max > this._min) ? max : this._min;
    this._critical = (critical < this._max && critical > this._min)
      ? critical : this._max;
    this._warning = (warning < this._critical && warning > this._min)
      ? warning : this._critical;
  }

  cacheSize() { return this._cacheSize; }

  name() { return this._name; }

  units() { return this._units; }

  getValue(i) { return this._values[i]; }

  latestValue() { return this._values[this._values.length - 1]; }

  latestValueAsText() {
    return this.size() > 0 ? `${this.latestValue()} ${this.units()}` : '';
  }

  latestValueColorIndex() {
    if (this.size() > 0) {
      const v = this.latestValue();
      if (v >= this._critical) {
        return 'critical';
      }
      if (v >= this._warning) {
        return 'warning';
      }
    }
    return 'ok';
  }

  size() { return this._values.length; }

  getValues() {return this._values.slice(); }

  setValues(values) {
    if (!values) {
      this._values = [];
    } else {
      const len = values.length;
      if (len > this._cacheSize) {
        this._values = values.slice(len - this._cacheSize, len);
      } else {
        this._values = values.slice();
      }
    }
  }

  addValue(value) {
    if (this._values.length >= this._cacheSize) {
      this._values.shift();
    }
    this._values.push(value);
    return this;
  }

  min() { return this._min; }

  max() { return this._max; }

  warning() { return this._warning; }

  critical() { return this._critical; }
}
