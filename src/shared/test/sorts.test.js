/*
 (C) Copyright 2015 Hewlett Packard Enterprise Development LP

    Licensed under the Apache License, Version 2.0 (the 'License'); you may
    not use this file except in compliance with the License. You may obtain
    a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
    License for the specific language governing permissions and limitations
    under the License.
*/

/*global describe, it, expect */

import { naturalSort } from '../sorts.js';


describe('sorts: natural', () => {

  it('handles basic case', () => {
    const result = naturalSort(1, 2);
    expect(result).toEqual(-1);
  });

  it('sort numbers where one parameter is a hyphenated number case 1', () => {
    const result = naturalSort(1, '2-1');
    expect(result).toEqual(-1);
  });

  it('sort numbers where one parameter is a hyphenated number case 2', () => {
    const result = naturalSort(49, '49-1');
    expect(result).toEqual(0);
  });

  it('handles number and string for natural Sort method', () => {
    const result = naturalSort(1, 'lag1234');
    expect(result).toEqual(-1);
  });

  it('sorts strings which start with lag and end with a number case1', () => {
    const result = naturalSort('lag123', 'lag1234');
    expect(result).toEqual(-1);
  });

  it('sorts strings which start with lag and end with a number case2', () => {
    const result = naturalSort('lag1234', 'lag123');
    expect(result).toEqual(1);
  });

  it('handles two hyphenated numbers case 1', () => {
    const result = naturalSort('53-2', '53-1');
    expect(result).toEqual(-1);
  });

  it('handles two hyphenated numbers case 2', () => {
    const result = naturalSort('53-1', '53-2');
    expect(result).toEqual(1);
  });

  it('handles empty string parameters case for natural Sort method', () => {
    const result = naturalSort('', '');
    expect(result).toEqual(0);
  });

  it('handles both parameters are 0 for natural Sort method', () => {
    const result = naturalSort(0, 0);
    expect(result).toEqual(0);
  });

  it('handles alphanumeric parameters for natural Sort method', () => {
    const result = naturalSort('l123a2', 'x154c3');
    expect(result).toEqual(-1);
  });

});
