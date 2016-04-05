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

/*global describe, beforeAll, afterAll, afterEach, it, expect */
/*eslint no-undefined:0*/

import Agent, { agentInit, getPrefix } from '../agent.js';
import AgentMock from 'superagent-mock';
import Async from 'async';


describe('agent', () => {

  const config = [{
    pattern: 'https://test.com(.*)',
    fixtures: match => {
      if (match[1] === '/data1') {
        return 'DATA1';
      }
      if (match[1] === '/data2') {
        return 'DATA2';
      }
      if (match[1] === '/e404') {
        const e = new Error('e404');
        e.status = 404;
        e.url = 'https://test.com/e404';
        throw e;
      }
    },
    get: (match, data) => { return { body: data }; }
  }];

  beforeAll(() => {
    AgentMock(Agent.request, config);
  });

  afterAll(() => {
    AgentMock.unset();
  });

  afterEach(() => {
    agentInit('');
  });

  it('gets mock server data for /data1', (done) => {
    Agent.get('https://test.com/data1', (err, res) => {
      expect(err).toBeNull();
      expect(res.body).toEqual('DATA1');
      done();
    });
  });

  it('injects a prefix for URLs', (done) => {
    expect(getPrefix()).toEqual('');
    agentInit({ prefix: 'https://test.com' });
    expect(getPrefix()).toEqual('https://test.com');
    Agent.get('/data1', (err, res) => {
      expect(res.body).toEqual('DATA1');
      done();
    });
  });

  it('clears prefix after each test', () => {
    expect(getPrefix()).toEqual('');
  });

  it('allows requests in parallel', (done) => {
    agentInit({ prefix: 'https://test.com' });
    Async.parallel([
      cb => Agent.get('/data1', cb),
      cb => Agent.get('/data2', cb),
    ], (err, res) => {
      expect(err).toBeNull();
      expect(res).toEqual([
        { body: 'DATA1' },
        { body: 'DATA2' },
      ]);
      done();
    });
  });

  it('handler errors', (done) => {
    agentInit({ prefix: 'https://test.com' });
    const url = '/e404';
    Agent.get(url, (err, res) => {
      expect(res).toBeDefined();
      expect(err.toString()).toEqual('Error: e404');
      expect(err.status).toEqual(404);
      expect(err.url).toEqual(`${getPrefix()}/e404`);
      done();
    });
  });

  it('handler errors in parallel', (done) => {
    agentInit({ prefix: 'https://test.com' });
    Async.parallel([
      cb => Agent.get('/data1', cb),
      cb => Agent.get('/e404', cb),
    ], (err, res) => {
      expect(res).toBeDefined();
      expect(err.toString()).toEqual('Error: e404');
      done();
    });
  });

  it('allows requests in waterfall', (done) => {
    agentInit({ prefix: 'https://test.com' });
    Async.waterfall([
      cb1 => Agent.get('/data1', cb1),
      (r1, cb2) => Agent.get('/data2', (e2, r2) => cb2(e2, [r1, r2])),
    ], (err, res) => {
      expect(err).toBeNull();
      expect(res).toEqual([
        { body: 'DATA1' },
        { body: 'DATA2' },
      ]);
      done();
    });
  });

  it('handles request errors in waterfall', (done) => {
    agentInit({ prefix: 'https://test.com' });
    Async.waterfall([
      cb1 => Agent.get('/data1', cb1),
      (r1, cb2) => Agent.get('/e404', (e2, r2) => cb2(e2, [r1, r2])),
    ], (err, res) => {
      expect(res).toBeDefined();
      expect(err.toString()).toEqual('Error: e404');
      done();
    });
  });

});
