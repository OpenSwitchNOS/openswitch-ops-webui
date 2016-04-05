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

import Formatter from '../formatter.js';

describe('formatter', () => {

  const SPECS = [
    {
      name: 'handles basic case',
      bitsPerSecond: 1000000000,
      result: '1 Gbps'
    },
    {
      name: 'handles bitsPerSecond of 0',
      bitsPerSecond: 0,
      result: '0 bps'
    },
    {
      name: 'handles parameter passes as strings',
      bitsPerSecond: '1000000000',
      result: '1 Gbps'
    },

  ];

  const SPECSFORMBPS = [
    {
      name: 'handles basic case',
      megaBitsPerSecond: 8000,
      result: '8 Gbps'
    },
    {
      name: 'handles bitsPerSecond of 0',
      megaBitsPerSecond: 0,
      result: '0 bps'
    },
    {
      name: 'handles parameter as a string',
      megaBitsPerSecond: 40000,
      result: '40 Gbps'
    },

  ];

  SPECS.forEach(s => {
    it(s.name, () => {
      const result = Formatter.bpsToString(s.bitsPerSecond);
      expect(result).toEqual(s.result);
    });
  });

  it('handles isNaN for bpsToString Method Case 1', () => {
    expect(Formatter.bpsToString('a')).toEqual('');
  });

  it('handles undefined/null for bpsToString', () => {
    expect(Formatter.bpsToString({}.bogus)).toEqual('');
    expect(Formatter.bpsToString(null)).toEqual('');
  });

  SPECSFORMBPS.forEach(s => {
    it(s.name, () => {
      const result = Formatter.mbpsToString(s.megaBitsPerSecond);
      expect(result).toEqual(s.result);
    });
  });

  it('handles isNaN for mbpsToString Method Case 1', () => {
    expect(Formatter.mbpsToString('a')).toEqual('');
  });

  it('handles undefined/null for mbpsToString Method Case 2', () => {
    expect(Formatter.mbpsToString({}.bogus)).toEqual('');
    expect(Formatter.mbpsToString(null)).toEqual('');
  });

  it('handles toCommaString XXX,XXX,XXX', () => {
    expect(Formatter.toCommaString(100000000)).toEqual('100,000,000');
  });

  it('handles toCommaString 0', () => {
    expect(Formatter.toCommaString(0)).toEqual('0');
  });

  it('handles toCommaString 10', () => {
    expect(Formatter.toCommaString(10)).toEqual('10');
  });

  it('handles toCommaString 999', () => {
    expect(Formatter.toCommaString(999)).toEqual('999');
  });

  it('handles toCommaString 1999', () => {
    expect(Formatter.toCommaString(1999)).toEqual('1,999');
  });

  it('handles isNaN for toCommaString', () => {
    expect(Formatter.toCommaString('abc')).toEqual('');
  });

  it('handles undefined/null for toCommaString', () => {
    expect(Formatter.toCommaString({}.bogus)).toEqual('');
    expect(Formatter.toCommaString(null)).toEqual('');
  });

  it('handles undefined/null for toCommaString', () => {
    expect(Formatter.toCommaString({}.bogus)).toEqual('');
  });

});
