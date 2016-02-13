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
    get: (match, data) => { return { body: data }; }
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

  it('creates action types', () => {
    const at = Dux.fetchActionTypes('abc');
    expect(at).toEqual({
      REQUEST: 'abc/FETCH_REQUEST',
      SUCCESS: 'abc/FETCH_SUCCESS',
      FAILURE: 'abc/FETCH_FAILURE',
    });
  });

  it('protectedParse', () => {
    function fn(r) { return { aa: r.a, bb: r.b }; }
    const data = { a: 'a', b: 'b' };
    expect(Dux.protectedParse('n', fn, data)).toEqual({ aa: 'a', bb: 'b' });
    function errFn(r) { return { aa: r.a.bogus.bogus }; }
    expect(Dux.protectedParse('n', errFn, data)).toEqual({});
  });

  it('performFetch - success with single URL', () => {
    expect(dispatchedActions.length).toBe(0);

    Dux.performFetch(
      Dux.fetchActionTypes('abc'),
      dispatch,
      'https://test.com/data1'
    );

    expect(dispatchedActions.length).toBe(2);
    expect(dispatchedActions[0]).toEqual({ type: 'abc/FETCH_REQUEST' });
    expect(dispatchedActions[1]).toEqual({
      type: 'abc/FETCH_SUCCESS',
      result: { body: 'DATA1' },
    });
  });

  it('performFetch - error with single URL', () => {
    expect(dispatchedActions.length).toBe(0);
    expect(getPrefix()).toEqual('');

    Dux.performFetch(
      Dux.fetchActionTypes('abc'),
      dispatch,
      'https://test.com/e404'
    );

    expect(dispatchedActions.length).toBe(2);
    expect(dispatchedActions[0]).toEqual({ type: 'abc/FETCH_REQUEST' });
    expect(dispatchedActions[1]).toEqual({
      type: 'abc/FETCH_FAILURE',
      error: {
        url: 'https://test.com/e404',
        status: undefined,
        title: '404',
        msg: undefined,
      }
    });
  });

  it('performFetch - success with multiple URLs', () => {
    expect(dispatchedActions.length).toBe(0);

    Dux.performFetch(
      Dux.fetchActionTypes('abc'),
      dispatch,
      [ 'https://test.com/data1', 'https://test.com/data2' ]
    );

    expect(dispatchedActions.length).toBe(2);
    expect(dispatchedActions[0]).toEqual({ type: 'abc/FETCH_REQUEST' });
    expect(dispatchedActions[1]).toEqual({
      type: 'abc/FETCH_SUCCESS',
      result: [ { body: 'DATA1' }, { body: 'DATA2' } ],
    });
  });

  it('performFetch - error with multiple URLs', () => {
    expect(dispatchedActions.length).toBe(0);
    expect(getPrefix()).toEqual('');

    Dux.performFetch(
      Dux.fetchActionTypes('abc'),
      dispatch,
      [ 'https://test.com/e404', 'https://test.com/data2' ]
    );

    expect(dispatchedActions.length).toBe(2);
    expect(dispatchedActions[0]).toEqual({ type: 'abc/FETCH_REQUEST' });
    expect(dispatchedActions[1]).toEqual({
      type: 'abc/FETCH_FAILURE',
      error: {
        url: 'https://test.com/e404',
        status: undefined,
        title: '404',
        msg: undefined,
      },
    });
  });

  it('isReadyToFetch', () => {
    const store = {};
    expect(Dux.isReadyToFetch(store, 0)).toBeFalsy();
    store.isFetching = true;
    expect(Dux.isReadyToFetch(store, 0)).toBeFalsy();
    store.lastUpdate = 10;
    expect(Dux.isReadyToFetch(store, 0)).toBeFalsy();
    expect(Dux.isReadyToFetch(store, 10)).toBeFalsy();
    store.isFetching = false;
    expect(Dux.isReadyToFetch(store, 10)).toBeFalsy();
    expect(Dux.isReadyToFetch(store, 100000)).toBeTruthy();
  });

  it('creates fetchAction correctly', () => {
    const actionFn = Dux.fetchAction('abc', [
      'https://test.com/data1', 'https://test.com/data2'
    ]);
    const store = {
      abc: { isFetching: true, lastUpdate: 0 }
    };
    function getStoreFn() { return store; }

    actionFn(dispatch, getStoreFn);
    expect(dispatchedActions.length).toBe(0);

    store.abc.isFetching = false;

    actionFn(dispatch, getStoreFn);
    expect(dispatchedActions.length).toBe(2);
    expect(dispatchedActions[0]).toEqual({ type: 'abc/FETCH_REQUEST' });
    expect(dispatchedActions[1]).toEqual({
      type: 'abc/FETCH_SUCCESS',
      result: [ { body: 'DATA1' }, { body: 'DATA2' } ],
    });
  });

  it('fetchAction debounce works', () => {
    const actionFn = Dux.fetchAction('abc', 'https://test.com/data1');
    const store = {
      abc: { isFetching: false, lastUpdate: 0 }
    };
    function getStoreFn() { return store; }

    expect(dispatchedActions.length).toBe(0);

    actionFn(dispatch, getStoreFn);
    expect(dispatchedActions.length).toBe(2);

    store.abc.lastUpdate = Date.now();

    actionFn(dispatch, getStoreFn);
    expect(dispatchedActions.length).toBe(2);

    actionFn(dispatch, getStoreFn);
    expect(dispatchedActions.length).toBe(2);
  });

  it('creates fetchReducer correctly', () => {
    function parseFn(result) {
      return {
        b: result.b,
      };
    }
    const reducer = Dux.fetchReducer('abc', { a: 'a' }, parseFn);

    let s = reducer(undefined, {type: 'bogos'});
    expect(s).toEqual({
      isFetching: false, lastUpdate: 0, lastError: null, a: 'a'
    });

    s = reducer(s, {type: 'abc/FETCH_REQUEST'});
    expect(s).toEqual({
      isFetching: true, lastUpdate: 0, lastError: null, a: 'a'
    });

    s = reducer(s, {type: 'abc/FETCH_FAILURE', error: 'E1'});
    expect(s).toEqual({
      isFetching: false, lastUpdate: 0, lastError: 'E1', a: 'a'
    });

    s = reducer(s, {type: 'abc/FETCH_SUCCESS', result: {b: 'rb', c: 'rc'}});
    expect(s.lastUpdate).toBeGreaterThan(0);
    s.lastUpdate = 0;
    expect(s).toEqual({
      isFetching: false,
      lastError: null,
      lastUpdate: 0,
      a: 'a',
      b: 'rb',
    });
  });

});
