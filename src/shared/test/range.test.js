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

import Range from 'range.js';

describe('range', () => {

  const SPECS = [
    {
      name: 'handles basic case',
      init: '1-5, 12-15',
      add: [6, [7, 8], '9-11'],
      sub: [2],
      has: '5, 9, 12-14',
      hasNot: '16',
      toString: '1, 3-15',
      toArray: [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      toRanges: [[1, 1], [3, 15]],
      firstItem: 1,
      lastItem: 15,
      continuous: false,
    },
    {
      name: 'handles another basic case',
      init: '',
      add: ['1-18'],
      sub: [18],
      has: '1, 2-5, 9',
      hasNot: '18',
      toString: '1-17',
      toArray: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
      toRanges: [[1, 17]],
      firstItem: 1,
      lastItem: 17,
      continuous: true,
    },
    {
      name: 'handles empty case',
      init: '',
      add: [],
      sub: [],
      has: '',
      hasNot: '18',
      toString: '',
      toArray: [],
      toRanges: [],
      firstItem: 0,
      lastItem: 0,
      continuous: false,
    },
  ];

  SPECS.forEach(s => {
    it(s.name, () => {
      const rng = new Range(s.init);
      s.add.forEach(v => rng.append(v));
      s.sub.forEach(v => rng.subtract(v));
      expect(rng.has(s.has)).toBeTruthy();
      expect(rng.has(s.hasNot)).toBeFalsy();
      expect(rng.toString()).toEqual(s.toString);
      expect(rng.toArray()).toEqual(s.toArray);
      expect(rng.getRanges()).toEqual(s.toRanges);
      expect(rng.firstItem()).toEqual(s.firstItem);
      expect(rng.lastItem()).toEqual(s.lastItem);
      if (s.continuous) {
        expect(rng.isContinuous()).toBeTruthy();
      } else {
        expect(rng.isContinuous()).toBeFalsy();
      }
    });
  });

  function ras(init, append) {
    return new Range(init).append(append).toString();
  }

  it('must append values correctly', () => {
    expect(ras('5-10', 5)).toEqual('5-10');
    expect(ras('5-10', 8)).toEqual('5-10');
    expect(ras('5-10', 10)).toEqual('5-10');
    expect(ras('5-10', 11)).toEqual('5-11');
    expect(ras('5-10', 4)).toEqual('4-10');
    expect(ras('5-10', 15)).toEqual('5-10, 15');
    expect(ras('5-10', 1)).toEqual('1, 5-10');
    expect(ras('5-10,15-20', 3)).toEqual('3, 5-10, 15-20');
    expect(ras('5-10,15-20', 25)).toEqual('5-10, 15-20, 25');
    expect(ras('1-10,12-15,17-20', 11)).toEqual('1-15, 17-20');
    expect(ras('1-10,12-15,17-20', [[1, 100]])).toEqual('1-100');
    expect(ras('1-10,12-15,17-20,100', [[5, 14]])).toEqual('1-15, 17-20, 100');
    expect(ras('1-10,12-15,17-20', [[14, 19]])).toEqual('1-10, 12-20');
  });

  it('must accept various append types', () => {
    expect(ras('5-10,15-20', 12)).toEqual('5-10, 12, 15-20');
    expect(ras('5-10,15-20', '11-14,21-25')).toEqual('5-25');
    expect(ras('5-10,15-20', [12])).toEqual('5-10, 12, 15-20');
    expect(ras('5-10,15-20', [[12, 13]])).toEqual('5-10, 12-13, 15-20');
    expect(ras('5-10,15-20', new Range('11-14,21-25'))).toEqual('5-25');
  });

  it('append must be chainable', () => {
    const rng = new Range('1-50');
    rng.append(60).append('70').append(new Range([80])).appendRange(90, 90);
    expect(rng.toString()).toEqual('1-50, 60, 70, 80, 90');
  });

  function rss(init, subtract) {
    return new Range(init).subtract(subtract).toString();
  }

  function rsrs(init, sr1, sr2) {
    return new Range(init).subtractRange(sr1, sr2).toString();
  }

  it('must subtract values correctly', () => {
    expect(rss('1-10', 100)).toEqual('1-10');
    expect(rss('1-10', 0)).toEqual('1-10');
    expect(rss('1-10', 11)).toEqual('1-10');
    expect(rss('1-10', 1)).toEqual('2-10');
    expect(rss('1-10', 10)).toEqual('1-9');
    expect(rsrs('1-10', 1, 10)).toEqual('');
    expect(rsrs('1-10', 5, 8)).toEqual('1-4, 9-10');
    expect(rsrs('1-10,20-30', 11, 19)).toEqual('1-10, 20-30');
    expect(rsrs('1-10,20-30', 5, 25)).toEqual('1-4, 26-30');
  });

  it('subtract must be chainable', () => {
    const rng = new Range('1-50');
    rng.subtract(40).subtract('30').subtract(new Range([20]))
      .subtractRange(10, 10);
    expect(rng.toString()).toEqual('1-9, 11-19, 21-29, 31-39, 41-50');
  });

  it('converts to an array', () => {
    expect(new Range('').toArray()).toEqual([]);
    expect(new Range('2').toArray()).toEqual([2]);
    expect(new Range('2-5').toArray()).toEqual([2, 3, 4, 5]);
    expect(new Range('2-3,8,10-12').toArray()).toEqual([2, 3, 8, 10, 11, 12]);
  });

  it('must not change the internal data after getRanges', () => {
    const rng = new Range('5,12-15,100');
    const rng2 = rng.getRanges();
    rng2[0][1] = 7;
    rng2[1][0] = 14;
    expect(rng.toString()).toEqual('5, 12-15, 100');
    expect(rng.firstItem()).toEqual(5);
  });

  it('handle equals', () => {
    expect(new Range('').equals('')).toBeTruthy();
    expect(new Range('5').equals('5')).toBeTruthy();
    expect(new Range('2-8').equals('2-8')).toBeTruthy();
    expect(new Range('2-8,10-12,15-20').equals('2-8,10-12,15-20')).toBeTruthy();
    expect(new Range('').equals('5')).toBeFalsy();
    expect(new Range('5').equals('5-6')).toBeFalsy();
    expect(new Range('2-8').equals('2-7')).toBeFalsy();
    expect(new Range('2-8,10-12,15-20').equals('2-8,10-12,15-20,23-25'))
      .toBeFalsy();
  });

  it('handles hasRange', () => {
    expect(new Range('5-20,25-100,150-300').hasRange(5, 15)).toBeTruthy();
    expect(new Range('5-20,25-100,150-300').hasRange(3, 10)).toBeFalsy();
  });

  it('handles isContinuous', () => {
    expect(new Range('1').isContinuous()).toBeTruthy();
    expect(new Range('5-10').isContinuous()).toBeTruthy();
    expect(new Range('').isContinuous()).toBeFalsy();
    expect(new Range('5-10,12-15').isContinuous()).toBeFalsy();
  });

  it('handles length', () => {
    expect(new Range('').length()).toEqual(0);
    expect(new Range('5').length()).toEqual(1);
    expect(new Range('5-10').length()).toEqual(6);
    expect(new Range('1,3,10-15,20-21').length()).toEqual(10);
  });

  it('handles has check', () => {
    expect(new Range('5-20,25-100,150-300').has('7')).toBeTruthy();
    expect(new Range('5-20,25-100,150-300').has('25')).toBeTruthy();
    expect(new Range('5-20,25-100,150-300').has('300')).toBeTruthy();
    expect(new Range('5-20,25-100,150-300').has('5-10')).toBeTruthy();
    expect(new Range('5-20,25-100,150-300').has('5-10,25')).toBeTruthy();
    expect(new Range('5-20,25-100,150-300').has('25-40,160')).toBeTruthy();
    expect(new Range('5-20,25-100,150-300')
      .has('5-20,25-100,150-300')).toBeTruthy();
    expect(new Range('5-20,25-100,150-300')
      .has('5,80,18-7,280,100,15-20,25,200-250')).toBeTruthy();
    expect(new Range('5-20,25-100,150-300').has('')).toBeTruthy();

    expect(new Range('5-20,25-100,150-300').has('3')).toBeFalsy();
    expect(new Range('5-20,25-100,150-300').has('22')).toBeFalsy();
    expect(new Range('5-20,25-100,150-300').has('500')).toBeFalsy();
    expect(new Range('5-20,25-100,150-300').has('10-21')).toBeFalsy();
    expect(new Range('5-20,25-100,150-300').has('149-400')).toBeFalsy();
    expect(new Range('5-20,25-100,150-300')
      .has('5-20,25-103,150-300')).toBeFalsy();
    expect(new Range('5-20,25-100,150-300')
      .has('5-20,25-103,150-300')).toBeFalsy();
    expect(new Range('5-20,25-100,150-300')
      .has('5,80,18-7,280,100,15-20,25,200-250,301')).toBeFalsy();
  });

  it('must calculate intersections correctly', () => {
    function chk(r1, r2, range) {
      expect(new Range(r1).intersect(r2).equals(range)).toBeTruthy();
      expect(new Range(r2).intersect(r1).equals(range)).toBeTruthy();
    }
    chk('1-5', '8', '');
    chk('5-100', '1,10,50,70,80,90,100,101', '10,50,70,80,90,100');
    chk('5-100', '1-10,90-110', '5-10,90-100');
    chk('30-50,60-80,90-120', '45-65,75-90', '45-50,60-65,75-80,90');
    chk('10,12,14,16,18,20', '11,13,15,17,19,21', '');
    chk('10,12,14,16,18,20', '10,12,14,16,18,20', '10,12,14,16,18,20');
    chk('10-12,14-16,18-20', '11,13,15,17,19,21', '11,15,19');
    chk('10-12,14-16,18-20', '10-12,14-16,18-20', '10-12,14-16,18-20');
    chk('10-12,14-16,18-20', '20-22,24-26,28-30', '20');
  });

  it('intersect must be chainable', () => {
    expect(new Range('1-100').intersect('20-150').intersect('10-40').toString())
      .toEqual('20-40');
  });

});
