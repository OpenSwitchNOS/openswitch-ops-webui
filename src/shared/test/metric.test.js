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
import DataPoint from '../dataPoint.js';


describe('Metric', () => {

  function mkDataPoints(startValue, startTs, count) {
    const dps = [];
    for (let i=0; i<count; i++) {
      dps.push(new DataPoint(startValue + i, startTs + (i * 1000)));
    }
    return dps;
  }

  it('constructs with defaults', () => {
    const m = new Metric();
    expect(m.cacheSize()).toEqual(Metric.CACHE_SIZE);
    expect(m.getColorIndex()).toEqual('');
    expect(m.getName()).toEqual('');
    expect(m.getGroup()).toEqual('');
    expect(m.getUnits()).toEqual('');
    expect(m.getDataPoints()).toEqual([]);
    expect(m.size()).toEqual(0);
    expect(m.min()).toEqual(0);
    expect(m.warning()).toEqual(75);
    expect(m.critical()).toEqual(90);
    expect(m.max()).toEqual(100);
  });

  it('constructs with cache size', () => {
    const m = new Metric(3);
    expect(m.cacheSize()).toEqual(3);
  });

  it('constructs with simple configuration', () => {
    const m = new Metric()
      .setName('name')
      .setGroup('group')
      .setUnits('units')
      .setColorIndex('neutral-3');
    expect(m.getName()).toEqual('name');
    expect(m.getGroup()).toEqual('group');
    expect(m.getUnits()).toEqual('units');
    expect(m.getColorIndex()).toEqual('neutral-3');
  });

  it('constructs with datapoints', () => {
    const ts = Date.now();
    const dps = mkDataPoints(3, ts, 5);
    const m = new Metric(3).setDataPoints(dps);
    expect(m.size()).toEqual(3);
    expect(m.getDataPoints()).toEqual([
      new DataPoint(5, ts+2000),
      new DataPoint(6, ts+3000),
      new DataPoint(7, ts+4000),
    ]);
  });

  it('adds datapoints', () => {
    const ts = Date.now();
    const dps = mkDataPoints(5, ts, 2);
    const m = new Metric(2).setDataPoints(dps);
    expect(m.size()).toEqual(2);
    expect(m.getDataPoints()).toEqual([
      new DataPoint(5, ts),
      new DataPoint(6, ts+1000),
    ]);
    const addDps = mkDataPoints(1, ts+2000, 3);
    m.addDataPoint(addDps[0]).addDataPoint(addDps[1]).addDataPoint(addDps[2]);
    expect(m.getDataPoints()).toEqual([
      new DataPoint(2, ts+3000),
      new DataPoint(3, ts+4000),
    ]);
  });

  it('correctly returns latest data', () => {
    let m = new Metric();
    expect(m.latestDataPoint()).toBeUndefined();
    expect(m.latestValueUnits()).toEqual('');
    expect(m.latestValueColorIndex()).toEqual('ok');

    const ts = Date.now();
    const dps = mkDataPoints(2, ts, 3);
    m = new Metric(2).setDataPoints(dps).setUnits('tribbles');
    expect(m.size()).toEqual(2);
    expect(m.getDataPoints()).toEqual([
      new DataPoint(3, ts+1000),
      new DataPoint(4, ts+2000),
    ]);
    expect(m.latestDataPoint()).toEqual(new DataPoint(4, ts+2000));
    expect(m.latestValueUnits()).toEqual('4 tribbles');
  });

  it('ignores bad thresholds', () => {
    const m = new Metric();
    m.setThresholds(100, 0)
      .setThresholds(0, 100, 150)
      .setThresholds(0, 100, 75, 50);
    expect(m.min()).toEqual(0);
    expect(m.warning()).toEqual(75);
    expect(m.critical()).toEqual(90);
    expect(m.max()).toEqual(100);
  });

  it('configures thresholds', () => {
    const m = new Metric();
    m.setThresholds(0, 1000);
    expect(m.min()).toEqual(0);
    expect(m.warning()).toEqual(750);
    expect(m.critical()).toEqual(900);
    expect(m.max()).toEqual(1000);

    m.setThresholds(1, 10, 7, 9);
    expect(m.min()).toEqual(1);
    expect(m.warning()).toEqual(7);
    expect(m.critical()).toEqual(9);
    expect(m.max()).toEqual(10);

    const ts = Date.now();
    m.addDataPoint(new DataPoint(3, ts));
    expect(m.latestValueColorIndex()).toEqual('ok');

    m.addDataPoint(new DataPoint(7, ts));
    expect(m.latestValueColorIndex()).toEqual('warning');

    m.addDataPoint(new DataPoint(9.5, ts));
    expect(m.latestValueColorIndex()).toEqual('critical');
  });

  it('datapoints correctly store user data', () => {
    const ts = Date.now();
    const m = new Metric().setDataPoints([
      new DataPoint(3, ts+1000, 'ud#1'),
      new DataPoint(4, ts+2000, 'ud#2'),
    ]);
    expect(m.latestDataPoint().userData()).toEqual('ud#2');
  });

});
