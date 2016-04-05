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
/*eslint no-undefined:0*/

import AsyncDux, {
  DEFAULT_STATUS, cooledDown, mkActionTypes, protectedFn
} from '../asyncDux.js';


describe('asyncDux', () => {

  it('cooled down', () => {
    const s = { asyncStatus: { ...DEFAULT_STATUS } };

    expect(cooledDown(s, 0)).toBeFalsy();
    expect(cooledDown(s, 30000)).toBeTruthy();

    s.asyncStatus.inProgress = true;
    expect(cooledDown(s, 30000)).toBeFalsy();
  });

  it('makes action types', () => {
    const at = mkActionTypes('m');
    expect(at).toEqual({
      REQUEST: 'm/REQUEST',
      REQUEST_STEP: 'm/REQUEST_STEP',
      SUCCESS: 'm/SUCCESS',
      FAILURE: 'm/FAILURE',
      CLEAR_ERROR: 'm/CLEAR_ERROR',
    });
  });

  it('runs the parser inside a protected try/catch', () => {
    function fn(r) { return { aa: r.a, bb: r.b }; }
    const data = { a: 'a', b: 'b' };
    expect(protectedFn('m', fn, data)).toEqual({ aa: 'a', bb: 'b' });
    function errFn(r) { return { aa: r.a.bogus.bogus }; }
    expect(protectedFn('m', errFn, data)).toEqual({});
  });

  it('reducer handles request actions types', () => {
    const ad = new AsyncDux('m', {z: 'z'});
    const rfn = ad.reducer();

    const s1 = rfn(undefined, {type: 'bogus'});
    expect(s1).toEqual({asyncStatus: DEFAULT_STATUS, z: 'z'});

    const s2 = rfn(s1, ad.action('REQUEST', {
      title: 'T',
      numSteps: 3,
      currStepMsg: 'S1',
    }));

    let asyncStatus = {
      title: 'T',
      numSteps: 3,
      currStepMsg: 'S1',
      currStep: 1,
      inProgress: true,
      lastSuccessMillis: 0,
      lastError: null,
    };
    expect(s2).toEqual({ asyncStatus, z: 'z' });

    const s3 = rfn(s1, ad.action('REQUEST'));

    asyncStatus = {
      title: '',
      numSteps: 1,
      currStepMsg: '',
      currStep: 1,
      inProgress: true,
      lastSuccessMillis: 0,
      lastError: null,
    };
    expect(s3).toEqual({ asyncStatus, z: 'z' });
  });

  it('reducer handles request step actions types', () => {
    const ad = new AsyncDux('m', {z: 'z'});
    const rfn = ad.reducer();

    const s1 = rfn(undefined, {});

    const s2 = rfn(s1, ad.action('REQUEST', {
      title: 'T',
      numSteps: 3,
      currStepMsg: 'S1',
    }));

    const s3 = rfn(s2, ad.action('REQUEST_STEP', {
      currStep: 2,
      currStepMsg: 'S2',
    }));

    let asyncStatus = {
      title: 'T',
      numSteps: 3,
      currStepMsg: 'S2',
      currStep: 2,
      inProgress: true,
      lastSuccessMillis: 0,
      lastError: null,
    };
    expect(s3).toEqual({ asyncStatus, z: 'z' });

    const s4 = rfn(s2, ad.action('REQUEST_STEP', { currStep: 3 }));

    asyncStatus = {
      title: 'T',
      numSteps: 3,
      currStepMsg: '',
      currStep: 3,
      inProgress: true,
      lastSuccessMillis: 0,
      lastError: null,
    };
    expect(s4).toEqual({ asyncStatus, z: 'z' });
  });

  it('reducer handles failure & clear error actions types', () => {
    const ad = new AsyncDux('m', {z: 'z'});
    const rfn = ad.reducer();

    const s1 = rfn(undefined, {});

    const s2 = rfn(s1, ad.action('REQUEST', {
      title: 'T',
      numSteps: 3,
      currStepMsg: 'S1',
    }));

    const s3 = rfn(s2, ad.action('FAILURE', { error: 'E1' }));

    let asyncStatus = {
      title: 'T',
      numSteps: 3,
      currStepMsg: 'S1',
      currStep: 1,
      inProgress: false,
      lastSuccessMillis: 0,
      lastError: 'E1',
    };
    expect(s3).toEqual({ asyncStatus, z: 'z' });

    const s4 = rfn(s3, ad.action('CLEAR_ERROR'));

    asyncStatus = {
      title: 'T',
      numSteps: 3,
      currStepMsg: 'S1',
      currStep: 1,
      inProgress: false,
      lastSuccessMillis: 0,
      lastError: null,
    };
    expect(s4).toEqual({ asyncStatus, z: 'z' });
  });

  it('reducer handles success actions types with or without parser', () => {
    const ad = new AsyncDux('m', {z: 'z'});
    const rfn = ad.reducer();

    const s1 = rfn(undefined, {});

    const parser = (res) => { return { aa: res.a }; };

    const s2 = rfn(s1, ad.action('REQUEST', {
      title: 'T',
      numSteps: 3,
      currStepMsg: 'S1',
    }));

    const s3 = rfn(s2, ad.action('SUCCESS', { result: { a: 'aa' }, parser }));

    expect(s3.asyncStatus.lastSuccessMillis).toBeGreaterThan(0);
    s3.asyncStatus.lastSuccessMillis = 0;
    let asyncStatus = {
      title: 'T',
      numSteps: 0,
      currStepMsg: '',
      currStep: 0,
      inProgress: false,
      lastSuccessMillis: 0,
      lastError: null,
    };
    expect(s3).toEqual({ asyncStatus, z: 'z', aa: 'aa' });

    const s4 = rfn(s2, ad.action('SUCCESS', { result: { a: 'aa' } }));

    expect(s4.asyncStatus.lastSuccessMillis).toBeGreaterThan(0);
    s4.asyncStatus.lastSuccessMillis = 0;
    asyncStatus = {
      title: 'T',
      numSteps: 0,
      currStepMsg: '',
      currStep: 0,
      inProgress: false,
      lastSuccessMillis: 0,
      lastError: null,
    };
    expect(s4).toEqual({ asyncStatus, z: 'z' });
  });

});
