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

import * as util from '../util.js';
import Agent from 'superagent';
import AgentMock from 'superagent-mock';

describe('util', () => {

  const config1 = [{
    pattern: 'https://test.com(.*)',
    fixtures: match => { return (match[1] === '/data1') && 'DATA1'; },
    get: (match, data) => { return { body: data }; }
  }];

  const config2 = [{
    pattern: 'https://test.com(.*)',
    fixtures: match => { return (match[1] === '/data2') && 'DATA2'; },
    get: (match, data) => { return { body: data }; }
  }];

  describe('util', () => {

    it('adds 2 numbers', () => {
      expect(util.sum(1, 2)).toEqual(3);
    });

    it('gets mock server data', () => {
      AgentMock(Agent, config1);
      util.get('https://test.com/data1', (err, res) => {
        expect(res.body).toEqual('DATA1');
      });
    });

    it('gets mock server data again', () => {
      AgentMock(Agent, config2);
      util.get('https://test.com/data2', (err, res) => {
        expect(res.body).toEqual('DATA2');
      });
    });

  });

});
