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

import Async from 'async';

describe('async', () => {

  it('handles series', (done) => {
    Async.series([
      cb => cb(null, 'one'),
      cb => cb(null, 'two'),
    ],
    (err, result) => {
      expect(err).toBeNull();
      expect(result).toEqual(['one', 'two']);
      done();
    });
  });

  it('handles series error 1', (done) => {
    Async.series([
      cb => cb('errone', 'one'),
      cb => cb(null, 'two'),
    ],
    (err, result) => {
      expect(err).toEqual('errone');
      expect(result).toEqual(['one']);
      done();
    });
  });

  it('handles series error 2', (done) => {
    Async.series([
      cb => cb(null, 'one'),
      cb => cb('errtwo', 'two'),
    ],
    (err, result) => {
      expect(err).toEqual('errtwo');
      expect(result).toEqual(['one', 'two']);
      done();
    });
  });

  it('handles empty series', (done) => {
    Async.series([
    ],
    (err, result) => {
      expect(err).toBeNull();
      expect(result).toEqual([]);
      done();
    });
  });

  it('handles waterfall', (done) => {
    Async.waterfall([
      cb => cb(null, '1', '2'),
      (one, two, cb) => cb(null, '3'),
      (three, cb) => cb(null, 'done'),
    ],
    (err, result) => {
      expect(err).toBeNull();
      expect(result).toEqual('done');
      done();
    });
  });

  it('handles waterfall error', (done) => {
    Async.waterfall([
      cb => cb(null, '1', '2'),
      (one, two, cb) => cb('err', '3'),
      (three, cb) => cb(null, 'done'),
    ],
    (err, result) => {
      expect(err).toEqual('err');
      expect(result).toEqual('3');
      done();
    });
  });


});
