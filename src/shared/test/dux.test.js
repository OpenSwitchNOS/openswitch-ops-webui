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

/*global describe, it, expect, beforeEach, beforeAll, afterAll */
/*eslint no-undefined:0*/

import Dux from '../dux.js';
import Agent, { getPrefix } from '../agent.js';
import AgentMock from 'superagent-mock';

describe('dux', () => {

  let dispatchedActions;

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
    get: (match, data) => {
      return { body: data };
    },
  }];

  beforeAll(() => {
    AgentMock(Agent.request, config);
  });

  afterAll(() => {
    AgentMock.unset();
  });

  beforeEach(() => {
    dispatchedActions = [];
  });

  function dispatch(action) {
    dispatchedActions.push(action);
  }

  it('makes async stores', () => {
    const s = Dux.mkAsyncStore();
    expect(s).toEqual({
      inProgress: false,
      lastSuccessMillis: 0,
      lastError: null,
    });
  });

  it('makes action types', () => {
    const at = Dux.mkAsyncActionTypes('m', 'abc');
    expect(at).toEqual({
      REQUEST: 'm/abc/REQUEST',
      SUCCESS: 'm/abc/SUCCESS',
      FAILURE: 'm/abc/FAILURE',
      CLEAR_ERROR: 'm/abc/CLEAR_ERROR',
    });
  });

  it('protected function', () => {
    function fn(r) { return { aa: r.a, bb: r.b }; }
    const data = { a: 'a', b: 'b' };
    expect(Dux.protectedFn('m', 'n', fn, data)).toEqual({ aa: 'a', bb: 'b' });
    function errFn(r) { return { aa: r.a.bogus.bogus }; }
    expect(Dux.protectedFn('m', 'n', errFn, data)).toEqual({});
  });

  it('makes async handler', () => {
    const at = Dux.mkAsyncActionTypes('m', 'abc');
    function parseFn(result) { return { b: result.body.b }; }
    const handler = Dux.mkAsyncHandler('m', 'abc', at, parseFn);

    const s1 = { abc: Dux.mkAsyncStore(), a: 'a' };

    let s2 = handler(s1, {type: 'bogos'});
    expect(s2).toBeNull();

    s2 = handler(s1, {type: 'm/abc/REQUEST'});
    expect(s2).toEqual({
      abc: {
        inProgress: true,
        lastSuccessMillis: 0,
        lastError: null
      },
      a: 'a'
    });

    s2 = handler(s1, {type: 'm/abc/FAILURE', error: 'E1'});
    expect(s2).toEqual({
      abc: {
        inProgress: false,
        lastSuccessMillis: 0,
        lastError: 'E1',
      },
      a: 'a'
    });

    const result = { body: {b: 'rb', c: 'rc'} };

    s2 = handler(s1, { type: 'm/abc/SUCCESS', result });
    expect(s2.abc.lastSuccessMillis).toBeGreaterThan(0);
    s2.abc.lastSuccessMillis = 0;
    expect(s2).toEqual({
      abc: {
        inProgress: false,
        lastSuccessMillis: 0,
        lastError: null,
        b: 'rb',
      },
      a: 'a',
    });

    s2 = handler(s1, {type: 'm/abc/FAILURE', error: 'E2'});
    expect(s2).toEqual({
      abc: {
        inProgress: false,
        lastSuccessMillis: 0,
        lastError: 'E2',
      },
      a: 'a'
    });
    s2 = handler(s2, {type: 'm/abc/CLEAR_ERROR' });
    expect(s2).toEqual({
      abc: {
        inProgress: false,
        lastSuccessMillis: 0,
        lastError: null,
      },
      a: 'a',
    });
  });

  it('makes reducer', () => {
    const atA = Dux.mkAsyncActionTypes('m', 'a');
    const atB = Dux.mkAsyncActionTypes('m', 'b');
    function parseFnA(result) { return { aa: result.body.a }; }
    function parseFnB(result) { return { bb: result.body.b }; }
    const handlerA = Dux.mkAsyncHandler('m', 'a', atA, parseFnA);
    const handlerB = Dux.mkAsyncHandler('m', 'b', atB, parseFnB);

    const s1 = {a: Dux.mkAsyncStore(), b: Dux.mkAsyncStore(), z: 'z'};

    const reducer = Dux.mkReducer(s1, [handlerA, handlerB]);

    let s2 = reducer(undefined, {type: 'bogos'});
    expect(s2).toEqual(s1);

    s2 = reducer(s2, {type: 'm/a/REQUEST'});
    expect(s2).toEqual({
      a: { inProgress: true, lastSuccessMillis: 0, lastError: null },
      b: { inProgress: false, lastSuccessMillis: 0, lastError: null },
      z: 'z',
    });

    s2 = reducer(s2, {type: 'm/b/REQUEST'});
    expect(s2).toEqual({
      a: { inProgress: true, lastSuccessMillis: 0, lastError: null },
      b: { inProgress: true, lastSuccessMillis: 0, lastError: null },
      z: 'z',
    });

    const result = { body: { a: 'aaa', b: 'bbb'} };

    s2 = reducer(s2, { type: 'm/b/SUCCESS', result });
    expect(s2.b.lastSuccessMillis).toBeGreaterThan(0);
    s2.b.lastSuccessMillis = 0;
    expect(s2).toEqual({
      a: { inProgress: true, lastSuccessMillis: 0, lastError: null },
      b: {
        inProgress: false,
        lastSuccessMillis: 0,
        lastError: null,
        bb: 'bbb',
      },
      z: 'z',
    });
  });

  it('reducer without a parser', () => {
    const atA = Dux.mkAsyncActionTypes('m', 'a');
    const handlerA = Dux.mkAsyncHandler('m', 'a', atA);

    const s1 = {a: Dux.mkAsyncStore(), z: 'z'};

    const reducer = Dux.mkReducer(s1, [handlerA]);

    let s2 = reducer(undefined, {type: 'bogos'});
    expect(s2).toEqual(s1);

    s2 = reducer(s2, {type: 'm/a/REQUEST'});
    expect(s2).toEqual({
      a: { inProgress: true, lastSuccessMillis: 0, lastError: null },
      z: 'z',
    });

    const result = { body: { a: 'aaa', b: 'bbb'} };

    s2 = reducer(s2, { type: 'm/a/SUCCESS', result });
    expect(s2.a.lastSuccessMillis).toBeGreaterThan(0);
    s2.a.lastSuccessMillis = 0;
    expect(s2).toEqual({
      a: { inProgress: false, lastSuccessMillis: 0, lastError: null },
      z: 'z',
    });
  });

  it('action helpers', () => {
    expect(dispatchedActions.length).toBe(0);
    const at = Dux.mkAsyncActionTypes('m', 'z');
    const error = 'E1';
    const result = 'R1';

    expect(Dux.actionRequest(at)).toEqual({type: 'm/z/REQUEST'});
    expect(Dux.actionFail(at, 'E1')).toEqual({type: 'm/z/FAILURE', error});
    expect(Dux.actionSuccess(at, 'R1')).toEqual({type: 'm/z/SUCCESS', result});
    expect(Dux.actionClearError(at)).toEqual({type: 'm/z/CLEAR_ERROR'});

    Dux.dispatchRequest(dispatch, at);
    Dux.dispatchFail(dispatch, at, error);
    Dux.dispatchSuccess(dispatch, at, result);

    const da = dispatchedActions;
    expect(da.length).toBe(3);
    expect(da[0]).toEqual({ type: 'm/z/REQUEST' });
    expect(da[1]).toEqual({ type: 'm/z/FAILURE', error });
    expect(da[2]).toEqual({ type: 'm/z/SUCCESS', result });
  });

  it('async dispatcher', () => {
    expect(dispatchedActions.length).toBe(0);
    const at = Dux.mkAsyncActionTypes('m', 'z');
    const error = 'E1';
    const result = 'R1';

    const dispatcher = Dux.mkAsyncDispatcher(dispatch, at);
    dispatcher(null, result);
    dispatcher(error, result);

    const da = dispatchedActions;
    expect(da.length).toBe(2);
    expect(da[0]).toEqual({ type: 'm/z/SUCCESS', result });
    expect(da[1]).toEqual({ type: 'm/z/FAILURE', error });
  });

  it('wait for cooldown', () => {
    const s1 = {a: Dux.mkAsyncStore(), b: Dux.mkAsyncStore(), z: 'z'};

    expect(Dux.waitForCooldown(s1, 'a', 0)).toBeFalsy();
    expect(Dux.waitForCooldown(s1, 'b', 0)).toBeFalsy();

    expect(Dux.waitForCooldown(s1, 'a', 30000)).toBeTruthy();
    expect(Dux.waitForCooldown(s1, 'b', 0)).toBeFalsy();

    s1.a.inProgress = true;

    expect(Dux.waitForCooldown(s1, 'a', 30000)).toBeFalsy();
    expect(Dux.waitForCooldown(s1, 'b', 60000)).toBeTruthy();
  });

  it('get success single URL', () => {
    expect(dispatchedActions.length).toBe(0);

    const at = Dux.mkAsyncActionTypes('m', 'z');
    const result = { body: 'DATA1' };

    Dux.get(dispatch, at, 'https://test.com/data1');

    expect(dispatchedActions.length).toBe(2);
    expect(dispatchedActions[0]).toEqual({ type: 'm/z/REQUEST' });
    expect(dispatchedActions[1]).toEqual({ type: 'm/z/SUCCESS', result });
  });

  it('get error with single URL', () => {
    expect(dispatchedActions.length).toBe(0);
    expect(getPrefix()).toEqual('');

    const at = Dux.mkAsyncActionTypes('m', 'z');

    Dux.get(dispatch, at, 'https://test.com/e404');

    expect(dispatchedActions.length).toBe(2);
    expect(dispatchedActions[0]).toEqual({ type: 'm/z/REQUEST' });
    expect(dispatchedActions[1]).toEqual({
      type: 'm/z/FAILURE',
      error: {
        url: 'https://test.com/e404',
        status: undefined,
        title: '404',
        msg: undefined,
      }
    });
  });

  it('get success multiple URLs', () => {
    expect(dispatchedActions.length).toBe(0);

    const at = Dux.mkAsyncActionTypes('m', 'z');

    Dux.get(dispatch, at, ['https://test.com/data1', 'https://test.com/data2']);

    expect(dispatchedActions.length).toBe(2);
    expect(dispatchedActions[0]).toEqual({ type: 'm/z/REQUEST' });
    expect(dispatchedActions[1]).toEqual({
      type: 'm/z/SUCCESS',
      result: [
        { body: 'DATA1' },
        { body: 'DATA2' }
      ],
    });
  });

  it('get error multiple URLs', () => {
    expect(dispatchedActions.length).toBe(0);
    expect(getPrefix()).toEqual('');

    const at = Dux.mkAsyncActionTypes('m', 'z');

    Dux.get(dispatch, at, ['https://test.com/e404', 'https://test.com/data2']);

    expect(dispatchedActions.length).toBe(2);
    expect(dispatchedActions[0]).toEqual({ type: 'm/z/REQUEST' });
    expect(dispatchedActions[1]).toEqual({
      type: 'm/z/FAILURE',
      error: {
        url: 'https://test.com/e404',
        status: undefined,
        title: '404',
        msg: undefined,
      },
    });
  });


  it('get if cooled down', () => {
    expect(dispatchedActions.length).toBe(0);

    const s1 = {z: Dux.mkAsyncStore()};
    const at = Dux.mkAsyncActionTypes('m', 'z');
    const result = { body: 'DATA1' };

    Dux.getIfCooledDown(dispatch, s1, 'z', at, 'https://test.com/data1');
    expect(dispatchedActions.length).toBe(2);
    expect(dispatchedActions[0]).toEqual({ type: 'm/z/REQUEST' });
    expect(dispatchedActions[1]).toEqual({ type: 'm/z/SUCCESS', result });

    s1.z.lastSuccessMillis = Date.now();

    Dux.getIfCooledDown(dispatch, s1, 'z', at, 'https://test.com/data1');
    expect(dispatchedActions.length).toBe(2);

    s1.z.lastSuccessMillis = 0;

    Dux.getIfCooledDown(dispatch, s1, 'z', at, 'https://test.com/data1');
    expect(dispatchedActions.length).toBe(4);
    expect(dispatchedActions[2]).toEqual({ type: 'm/z/REQUEST' });
    expect(dispatchedActions[3]).toEqual({ type: 'm/z/SUCCESS', result });
  });

});
