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

import * as NumberFormatter from '../numberFormatter.js';

describe('numberFormatter', () => {

  const SPECS = [
    {
      name: 'handles basic case',
      bitsPerSecond: 1000000000,
      resultToFixed: '1 Gbps'
    },
    {
      name: 'handles bitsPerSecond of 0',
      bitsPerSecond: 0,
      resultToFixed: '0 bps'
    },
    {
      name: 'handles parameters passes as strings',
      bitsPerSecond: '1000000000',
      resultToFixed: '1 Gbps'
    },
  ];

  SPECS.forEach(s => {
    it(s.name, () => {
      const result = NumberFormatter.numberConversion(s.bitsPerSecond);
      expect(result).toEqual(s.resultToFixed);
    });
  });
});
