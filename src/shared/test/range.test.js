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

import { MultiRange as Range } from 'multi-integer-range';

describe('range', () => {

  const SPECS = [
    {
      name: 'handles basic case',
      init: '1-5,12-15',
      add: [6, [7, 8], '9-11'],
      sub: [2],
      has: '5,9,12-14',
      hasNot: '16',
      toString: '1,3-15',
      toArray: [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      toRanges: [[1, 1], [3, 15]],
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
      expect(rng.isContinuous()).toBeFalsy();
    });
  });

});
