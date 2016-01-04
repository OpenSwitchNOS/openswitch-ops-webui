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

/*global describe, it, expect */

import Metric from '../metric.js';

describe('Metric', () => {

  function verify(metric, cs, name, units, values, min, max, warning, critical) {
    expect(metric.cacheSize()).toEqual(cs);
    expect(metric.name()).toEqual(name);
    expect(metric.units()).toEqual(units);
    expect(metric.getValues()).toEqual(values);
    expect(metric.min()).toEqual(min);
    expect(metric.max()).toEqual(max);
    expect(metric.warning()).toEqual(warning);
    expect(metric.critical()).toEqual(critical);
    expect(metric.size()).toEqual(values.length);
  }

  it('constructs with defaults', () => {
    const m = new Metric();
    verify(m, Metric.CACHE_SIZE, '', '', [], 0, 0, 0, 0);
  });

  it('constructs configured', () => {
    const m = new Metric('name', 'units', [1, 2, 3], 10, 100, 75, 90, 5);
    verify(m, 5, 'name', 'units', [1, 2, 3], 10, 100, 75, 90);
  });

  it('can get threshold color', () => {
    const m = new Metric('name', 'units', [], 10, 100, 75, 90, 5);
    expect(m.latestValueColorIndex()).toEqual('ok');
    m.addValue(75);
    expect(m.latestValueColorIndex()).toEqual('warning');
    m.addValue(90);
    expect(m.latestValueColorIndex()).toEqual('critical');
  });

  it('constructs with bad thresholds', () => {
    let m = new Metric('name', 'units', [], 10, 1, 1, 1, 5);
    verify(m, 5, 'name', 'units', [], 10, 10, 10, 10);

    m = new Metric('name', 'units', [], 10, 100, 1, 1, 5);
    verify(m, 5, 'name', 'units', [], 10, 100, 100, 100);

    m = new Metric('name', 'units', [], 10, 100, 1, 90, 5);
    verify(m, 5, 'name', 'units', [], 10, 100, 90, 90);

    m = new Metric('name', 'units', [], 10, 100, 75, 60, 5);
    verify(m, 5, 'name', 'units', [], 10, 100, 60, 60);
  });

  it('can get value', () => {
    const m = new Metric('name', 'units', [1, 2, 3]);
    expect(m.getValue(0)).toEqual(1);
    expect(m.getValue(2)).toEqual(3);
  });

  it('can get value', () => {
    expect(new Metric().latestValueAsText()).toEqual('');

    const m = new Metric('name', 'units', [1, 2, 3]);

    expect(m.getValue(0)).toEqual(1);
    expect(m.getValue(2)).toEqual(3);

    expect(m.latestValue()).toEqual(3);
    expect(m.latestValueAsText()).toEqual('3 units');
  });

  it('can set values', () => {
    const m = new Metric('name', 'units', [1, 2, 3]);
    expect(m.getValues()).toEqual([1, 2, 3]);
    m.setValues([4, 5]);
    expect(m.getValues()).toEqual([4, 5]);
  });

  it('can set values over cache size', () => {
    const m = new Metric('name', 'units', [1, 2, 3, 4, 5], 10, 100, 75, 90, 3);
    verify(m, 3, 'name', 'units', [3, 4, 5], 10, 100, 75, 90);

    m.setValues([9, 8, 7]);
    verify(m, 3, 'name', 'units', [9, 8, 7], 10, 100, 75, 90);

    m.setValues([19, 18, 17, 16]);
    verify(m, 3, 'name', 'units', [18, 17, 16], 10, 100, 75, 90);
  });

  it('can add values over cache size', () => {
    const m = new Metric('name', 'units', [], 10, 100, 75, 90, 2);
    verify(m, 2, 'name', 'units', [], 10, 100, 75, 90);
    m.addValue(9).addValue(8).addValue(7).addValue(6).addValue(5);
    verify(m, 2, 'name', 'units', [6, 5], 10, 100, 75, 90);
  });

});
