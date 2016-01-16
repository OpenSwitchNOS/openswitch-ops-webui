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

/*global describe, it, expect, beforeAll */
/*eslint no-undefined:0*/

import * as Dux from '../dux.js';

describe('dux', () => {

  let dispatchedActions;

  beforeAll(() => {
    dispatchedActions = [];
  });

  function dispatch(action) {
    dispatchedActions.push(action);
  }

  it('creates fetch handlers correctly', () => {
    expect(dispatchedActions.length).toBe(0);

    const fh = Dux.mkFetchHandler(dispatch, 'ET', 'ST');

    fh(null, 'RESULT');
    expect(dispatchedActions.length).toBe(1);
    expect(dispatchedActions[0]).toEqual({ type: 'ST', result: 'RESULT' });

    fh('ERROR', 'RESULT');
    expect(dispatchedActions.length).toBe(2);
    expect(dispatchedActions[1]).toEqual({ type: 'ET', error: 'ERROR' });
  });

  const MODULE = 'mod1';
  const FETCH_REQUEST = 'fr';
  const FETCH_FAILURE = 'ff';
  const FETCH_SUCCESS = 'fs';
  const ACTIONS = { FETCH_REQUEST, FETCH_FAILURE, FETCH_SUCCESS };
  const SPECS_1 = {
    s1: {
      initialValue: { s1k1: 's1v1' },
      protectedParser: (result) => {
        return { s1k1: result.s1k1, s1k2: result.s1k2 };
      },
    },
    s2: {
      initialValue: { s2k1: 's2v1' },
      protectedParser: (result) => {
        return { s2k1: result.s2k1, s2k2: result.s2k2 };
      },
    }
  };
  const SPECS_2 = {
    s1: {
      initialValue: { s1k1: 's1v1' },
      protectedParser: (result) => {
        return { s1k1: result.thisIsBogus.andSoIsThis };
      },
    },
    s2: SPECS_1.s2,
  };

  it('default fetch reducer - initializes correctly', () => {
    const rdr = Dux.mkFetchReducer(MODULE, ACTIONS, SPECS_1);
    const newStore = rdr(undefined, {type: 'bogus'});
    expect(newStore).toEqual({
      isFetching: false,
      lastUpdate: 0,
      lastError: null,
      s1: SPECS_1.s1.initialValue,
      s2: SPECS_1.s2.initialValue,
    });
  });

  it('default fetch reducer - fetch request and failure', () => {
    const rdr = Dux.mkFetchReducer(MODULE, ACTIONS, SPECS_1);
    const store1 = rdr(undefined, { type: FETCH_REQUEST });
    expect(store1).toEqual({
      isFetching: true,
      lastUpdate: 0,
      lastError: null,
      s1: SPECS_1.s1.initialValue,
      s2: SPECS_1.s2.initialValue,
    });
    const store2 = rdr(store1, { type: FETCH_FAILURE, error: 'E1' });
    expect(store2).toEqual({
      isFetching: false,
      lastUpdate: 0,
      lastError: 'E1',
      s1: SPECS_1.s1.initialValue,
      s2: SPECS_1.s2.initialValue,
    });
  });

  it('default fetch reducer - fetch success', () => {
    const rdr = Dux.mkFetchReducer(MODULE, ACTIONS, SPECS_1);
    const store1 = rdr(undefined, { type: FETCH_REQUEST });

    const result = {
      s1k1: 's1k1v',
      s1k2: 's1k2v',
      s2k1: 's2k1v',
      s2k2: 's2k2v',
    };

    const store2 = rdr(store1, { type: FETCH_SUCCESS, result });
    expect(store2.lastUpdate).toBeGreaterThan(0);
    expect(store2).toEqual({
      isFetching: false,
      lastUpdate: store2.lastUpdate,
      lastError: null,
      s1: { s1k1: 's1k1v', s1k2: 's1k2v' },
      s2: { s2k1: 's2k1v', s2k2: 's2k2v' },
    });
  });

  it('default fetch reducer - handle partial errors', () => {
    const rdr = Dux.mkFetchReducer(MODULE, ACTIONS, SPECS_2);
    const store1 = rdr(undefined, { type: FETCH_REQUEST });

    const result = {
      s1k1: 's1k1v',
      s1k2: 's1k2v',
      s2k1: 's2k1v',
      s2k2: 's2k2v',
    };

    const store2 = rdr(store1, { type: FETCH_SUCCESS, result });
    expect(store2.lastUpdate).toBeGreaterThan(0);
    expect(store2).toEqual({
      isFetching: false,
      lastUpdate: store2.lastUpdate,
      lastError: null,
      s1: SPECS_1.s1.initialValue,
      s2: { s2k1: 's2k1v', s2k2: 's2k2v' },
    });
  });

});
