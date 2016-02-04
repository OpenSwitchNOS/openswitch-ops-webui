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

import InterfaceData, {
  DUPLEX_HALF, DUPLEX_FULL, TX, RX, TX_RX
} from '../interfaceData.js';

import InterfaceCache from '../interfaceCache.js';

const TX_NAME = '~tx~';
const RX_NAME = '~rx~';
const TX_RX_NAME = '~txRx~';

describe('InterfaceCache', () => {

  it('handles full duplex objects', () => {
    const d = new InterfaceData('1', 1000, DUPLEX_FULL);
    expect(d.id()).toEqual('1');
    expect(d.duplex()).toEqual(DUPLEX_FULL);
    expect(d.speed()).toEqual(1000);
    expect(d.metrics().length).toEqual(2);
    expect(d.isMetricStillValid(1000, DUPLEX_FULL)).toBeTruthy();
    expect(d.isMetricStillValid(100, DUPLEX_FULL)).toBeFalsy();
    expect(d.isMetricStillValid(1000, DUPLEX_HALF)).toBeFalsy();
    expect(d.lastUpdate(TX)).toEqual(0);
    expect(d.lastUpdate(RX)).toEqual(0);
  });

  it('handles half duplex objects', () => {
    const d = new InterfaceData('2', 100, DUPLEX_HALF);
    expect(d.id()).toEqual('2');
    expect(d.duplex()).toEqual(DUPLEX_HALF);
    expect(d.speed()).toEqual(100);
    expect(d.metrics().length).toEqual(1);
    expect(d.isMetricStillValid(100, DUPLEX_HALF)).toBeTruthy();
    expect(d.isMetricStillValid(100, DUPLEX_FULL)).toBeFalsy();
    expect(d.isMetricStillValid(1000, DUPLEX_HALF)).toBeFalsy();
    expect(d.lastUpdate(TX)).toEqual(0);
    expect(d.lastUpdate(RX)).toEqual(0);
  });

  it('creates full duplex metrics correctly', () => {
    const d = new InterfaceData('3', 100, DUPLEX_FULL);
    let m = d.metric(TX);
    expect(m.getGroup()).toEqual('3');
    expect(m.getName()).toEqual(TX_NAME);
    m = d.metric(RX);
    expect(m.getGroup()).toEqual('3');
    expect(m.getName()).toEqual(RX_NAME);
  });

  it('creates half duplex metrics correctly', () => {
    const d = new InterfaceData('4', 100, DUPLEX_HALF);
    const m = d.metric(TX_RX);
    expect(m.getGroup()).toEqual('4');
    expect(m.getName()).toEqual(TX_RX_NAME);
  });

  it('updates metrics correctly', () => {
    const d = new InterfaceData('5', 10000000, DUPLEX_FULL);

    expect(d.updateMetric(TX, 100, 11)).toBeFalsy();
    expect(d.updateMetric(RX, 100, 11)).toBeFalsy();

    expect(d.lastUpdate(TX)).toEqual(11);
    expect(d.bytes(TX)).toEqual(100);

    expect(d.lastUpdate(RX)).toEqual(11);
    expect(d.bytes(RX)).toEqual(100);

    let m = d.metric(TX);
    expect(m.getGroup()).toEqual('5');
    expect(m.getName()).toEqual(TX_NAME);
    expect(m.size()).toEqual(0);

    m = d.metric(RX);
    expect(m.getGroup()).toEqual('5');
    expect(m.getName()).toEqual(RX_NAME);
    expect(m.size()).toEqual(0);

    expect(d.updateMetric(TX, 10000, 21)).toBeTruthy();
    expect(d.updateMetric(RX, 10000, 21)).toBeTruthy();

    expect(d.lastUpdate(TX)).toEqual(21);
    expect(d.bytes(TX)).toEqual(10000);

    expect(d.lastUpdate(RX)).toEqual(21);
    expect(d.bytes(RX)).toEqual(10000);

    m = d.metric(TX);
    expect(m.getGroup()).toEqual('5');
    expect(m.getName()).toEqual(TX_NAME);
    expect(m.size()).toEqual(1);
    expect(m.latestDataPoint().value()).toEqual(79);
    expect(m.latestDataPoint().ts()).toEqual(21);

    m = d.metric(RX);
    expect(m.getGroup()).toEqual('5');
    expect(m.getName()).toEqual(RX_NAME);
    expect(m.size()).toEqual(1);
    expect(m.latestDataPoint().value()).toEqual(79);
    expect(m.latestDataPoint().ts()).toEqual(21);
  });

  it('cache gets or creates interface', () => {
    const ic = new InterfaceCache();
    expect(ic.size()).toEqual(0);
    expect(ic.entity('id0')).toBeUndefined();

    let ent = ic.getOrCreateInterface('id0', 10, DUPLEX_FULL);
    expect(ic.size()).toEqual(1);
    expect(ic.entity('id0')).toEqual(ent);
    expect(ent.id()).toEqual('id0');
    expect(ent.speed()).toEqual(10);
    expect(ent.duplex()).toEqual(DUPLEX_FULL);

    ent = ic.getOrCreateInterface('id0', 10, DUPLEX_FULL);
    expect(ic.size()).toEqual(1);
    expect(ic.entity('id0')).toEqual(ent);
    expect(ent.id()).toEqual('id0');
    expect(ent.speed()).toEqual(10);
    expect(ent.duplex()).toEqual(DUPLEX_FULL);

    ent = ic.getOrCreateInterface('id1', 101, DUPLEX_HALF);
    expect(ic.size()).toEqual(2);
    expect(ic.entity('id1')).toEqual(ent);
    expect(ent.id()).toEqual('id1');
    expect(ent.speed()).toEqual(101);
    expect(ent.duplex()).toEqual(DUPLEX_HALF);
  });

  it('cache creates metrics', () => {
    const ic = new InterfaceCache();

    const ent0 = ic.getOrCreateInterface('id0', 10000000, DUPLEX_FULL, {});
    const ent1 = ic.getOrCreateInterface('id1', 10000000, DUPLEX_HALF, {});

    let metrics = ic.metrics(11);
    let all = metrics.all;
    let top = metrics.top;
    expect(top.length).toEqual(0);
    expect(Object.keys(all).length).toEqual(0);

    ent0.updateMetric(TX, 100, 11);
    ent0.updateMetric(RX, 100, 11);
    ent1.updateMetric(TX_RX, 100, 11);

    metrics = ic.metrics(11);
    all = metrics.all;
    top = metrics.top;
    expect(top.length).toEqual(0);
    expect(Object.keys(all).length).toEqual(0);

    ent0.updateMetric(TX, 10000, 21);
    ent0.updateMetric(RX, 10000, 21);
    ent1.updateMetric(TX_RX, 10000, 21);

    metrics = ic.metrics(21);
    all = metrics.all;
    top = metrics.top;
    expect(top.length).toEqual(3);
    expect(Object.keys(all).length).toEqual(2);

    expect(top[0].getGroup()).toEqual('id0');
    expect(top[0].getName()).toEqual(RX_NAME);
    expect(top[1].getGroup()).toEqual('id0');
    expect(top[1].getName()).toEqual(TX_NAME);
    expect(top[2].getGroup()).toEqual('id1');
    expect(top[2].getName()).toEqual(TX_RX_NAME);

    expect(all.id0).toEqual([top[1], top[0]]);
    expect(all.id1).toEqual([top[2]]);
  });

  it('cache sorts top utilization values', () => {
    const ic = new InterfaceCache();

    const ent0 = ic.getOrCreateInterface('id0', 10000000, DUPLEX_FULL, {});
    const ent1 = ic.getOrCreateInterface('id1', 10000000, DUPLEX_FULL, {});

    ent0.updateMetric(TX, 100, 11);
    ent0.updateMetric(RX, 100, 11);
    ent1.updateMetric(TX, 100, 11);
    ent1.updateMetric(RX, 100, 11);

    ent0.updateMetric(TX, 20000, 21);
    ent0.updateMetric(RX, 10000, 21);
    ent1.updateMetric(TX, 10000, 21);
    ent1.updateMetric(RX, 20000, 21);

    const metrics = ic.metrics(21);
    const all = metrics.all;
    const top = metrics.top;
    expect(top.length).toEqual(4);
    expect(Object.keys(all).length).toEqual(2);

    expect(top[0].getGroup()).toEqual('id0');
    expect(top[0].getName()).toEqual(TX_NAME);
    expect(top[1].getGroup()).toEqual('id1');
    expect(top[1].getName()).toEqual(RX_NAME);
    expect(top[2].getGroup()).toEqual('id0');
    expect(top[2].getName()).toEqual(RX_NAME);
    expect(top[3].getGroup()).toEqual('id1');
    expect(top[3].getName()).toEqual(TX_NAME);
  });

});
