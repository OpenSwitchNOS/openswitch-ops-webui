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

import Agent, {
  agentInit, getPrefix, parseError, mkAgentHandler, getParallel,
} from '../agent.js';

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
        throw new Error(404);
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

  it('gets mock server data for /data1', () => {
    Agent.get('https://test.com/data1', (err, res) => {
      expect(err).toBeNull();
      expect(res.body).toEqual('DATA1');
    });
  });

  it('injects a prefix for URLs', () => {
    expect(getPrefix()).toEqual('');
    agentInit({ prefix: 'https://test.com' });
    expect(getPrefix()).toEqual('https://test.com');
    Agent.get('/data1', (err, res) => {
      expect(res.body).toEqual('DATA1');
    });
  });

  it('clears prefix after each test', () => {
    expect(getPrefix()).toEqual('');
  });

  it('parses errors with various responses', () => {
    const error = {
      status: '201',
      message: 'abc',
    };
    expect(parseError('https://test.com/data1', error)).toEqual({
      url: 'https://test.com/data1',
      status: '201',
      msg: 'abc',
      respMsg: undefined,
    });

    error.response = {};
    expect(parseError('https://test.com/data1', error)).toEqual({
      url: 'https://test.com/data1',
      status: '201',
      msg: 'abc',
      respMsg: undefined,
    });

    error.response = { error: {} };
    expect(parseError('https://test.com/data1', error)).toEqual({
      url: 'https://test.com/data1',
      status: '201',
      msg: 'abc',
      respMsg: undefined,
    });

    error.response = { error: { message: 'msg' } };
    expect(parseError('https://test.com/data1', error)).toEqual({
      url: 'https://test.com/data1',
      status: '201',
      msg: 'abc',
      respMsg: 'msg',
    });

  });

  it('allows requests in getParallel', () => {
    agentInit({ prefix: 'https://test.com' });
    getParallel([
      '/data1',
      '/data2',
    ], (err, results) => {
      expect(err).toBeNull();
      expect(results).toEqual([
        { body: 'DATA1' },
        { body: 'DATA2' },
      ]);
    });
  });

  it('allows single request when using getParallel', () => {
    agentInit({ prefix: 'https://test.com' });
    getParallel('/data1', (err, results) => {
      expect(err).toBeNull();
      expect(results).toEqual(
        { body: 'DATA1' },
      );
    });
  });

  it('provides a handler to inject the URL in the error', () => {
    agentInit({ prefix: 'https://test.com' });

    let url = '/data1';
    Agent.get(url, mkAgentHandler(url, (err, res) => {
      expect(err).toBeNull();
      expect(res.body).toEqual('DATA1');
    }));

    url = '/e404';
    Agent.get(url, mkAgentHandler(url, (err, res) => {
      expect(res).toBeDefined();
      expect(err).toEqual({
        url: `${getPrefix()}/e404`,
        status: undefined,
        msg: '404',
        respMsg: undefined,
      });
    }));
  });

  it('handler works in parallel requests', () => {
    agentInit({ prefix: 'https://test.com' });
    Async.parallel(
      {
        data1: (cb) => {
          Agent.get('/data1').end(mkAgentHandler('/data1', cb));
        },
        data2: (cb) => {
          Agent.get('/data2').end(mkAgentHandler('/data2', cb));
        },
      },
      (err, results) => {
        expect(err).toBeNull();
        expect(results).toEqual({
          data1: { body: 'DATA1' },
          data2: { body: 'DATA2' },
        });
      }
    );
  });

  it('handler works in getParallel requests with errors', () => {
    agentInit({ prefix: 'https://test.com' });
    getParallel([
      '/data1',
      '/e404',
    ], (err, results) => {
      expect(results).toBeDefined();
      expect(err).toEqual({
        url: `${getPrefix()}/e404`,
        status: undefined,
        msg: '404',
        respMsg: undefined,
      });
    });
  });

  it('handler works in getParallel single request with error', () => {
    agentInit({ prefix: 'https://test.com' });
    getParallel('/e404', (err, results) => {
      expect(results).toBeDefined();
      expect(err).toEqual({
        url: `${getPrefix()}/e404`,
        status: undefined,
        msg: '404',
        respMsg: undefined,
      });
    });
  });

});
