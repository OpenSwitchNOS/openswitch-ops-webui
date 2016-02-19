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

import * as Calc from '../calc.js';

describe('calc', () => {

  const SPECS = [
    {
      name: 'handles basic case',
      prev: 100000,
      curr: 12345678,
      speed: 100000000,
      interval: 5000,
      resultToFixed: '19.59'
    },
    {
      name: 'handles another basic case',
      prev: 100,
      curr: 10000,
      speed: 10000000,
      interval: 10,
      resultToFixed: '79.20'
    },
    {
      name: 'handles a prev of 0',
      prev: 0,
      curr: 3451234,
      speed: 1000000000,
      interval: 5000,
      resultToFixed: '0.55'
    },
    {
      name: 'handles current of 0',
      prev: 45673,
      curr: 0,
      speed: 1000000000,
      interval: 5000,
      resultToFixed: '0.00'
    },
    {
      name: 'handles speed of 0',
      prev: 3498764,
      curr: 8764509,
      speed: 0,
      interval: 5000,
      resultToFixed: '0.00'
    },
    {
      name: 'handles parameters passes as strings',
      prev: '100000',
      curr: '12345678',
      speed: '100000000',
      interval: '5000',
      resultToFixed: '19.59'
    },
    {
      name: 'handles above 100%',
      prev: 4562347,
      curr: 68723456,
      speed: 100000000,
      interval: 5000,
      resultToFixed: '100.00'
    },
    {
      name: 'handles interval of 0',
      prev: 4567123,
      curr: 764,
      speed: 1000000000,
      interval: 0,
      resultToFixed: '0.00'
    },
  ];

  SPECS.forEach(s => {
    it(s.name, () => {
      const result = Calc.utilization(s.prev, s.curr, s.speed, s.interval);
      expect(result.toFixed(2)).toEqual(s.resultToFixed);
    });
  });

});
