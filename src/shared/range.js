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


  This following library is a refactor of the EXCELLENT node module:
  multi-integer-range

  The MIT License (MIT)

  Copyright (c) 2015 Soichiro Miki

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/


/*eslint no-undefined:0, prefer-spread:0*/

const BAD_INPUT = 'bad input';

export default class Range {

  constructor(data) {
    this.ranges = [];
    if (typeof data === 'string') {
      this.parseString(data);
    } else if (typeof data === 'number') {
      this.ranges.push([data, data]);
    } else if (data instanceof Range) {
      this.ranges = data.getRanges();
    } else if (Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (Array.isArray(item)) {
          if (item.length === 2) {
            this.appendRange(item[0], item[1]);
          } else {
            throw new TypeError(BAD_INPUT);
          }
        } else if (typeof item === 'number') {
          this.append(item);
        } else {
          throw new TypeError(BAD_INPUT);
        }
      }
    } else if (data !== undefined) {
      throw new TypeError(BAD_INPUT);
    }
  }

  parseString(data) {
    const s = data.replace(/\s/g, '');
    if (s.length === 0) { return; }
    const array = s.split(',');
    for (let i = 0; i < array.length; i++) {
      const r = array[i];
      const match = r.match(/^(\d+)(\-(\d+))?$/);
      if (match) {
        const min = parseInt(match[1]);
        const max = typeof match[3] !== 'undefined' ? parseInt(match[3]) : min;
        this.appendRange(min, max);
      } else {
        throw new SyntaxError(BAD_INPUT);
      }
    }
  }

  clone() {
    return new Range(this);
  }

  append(value) {
    if (value === undefined) {
      throw new TypeError(BAD_INPUT);
    } else if (value instanceof Range) {
      for (let i = 0; i < value.ranges.length; i++) {
        const r = value.ranges[i];
        this.appendRange(r[0], r[1]);
      }
      return this;
    } else {
      return this.append(new Range(value));
    }
  }

  appendRange(min, max) {
    let newRange = [Math.max(0, min), max];
    if (newRange[0] > newRange[1]) {
      newRange = [newRange[1], newRange[0]];
    }
    const overlap = this.findOverlap(newRange);
    this.ranges.splice(overlap.lo, overlap.count, overlap.union);
    return this;
  }

  subtract(value) {
    if (value === undefined) {
      throw new TypeError(BAD_INPUT);
    } else if (value instanceof Range) {
      for (let i = 0; i < value.ranges.length; i++) {
        const r = value.ranges[i];
        this.subtractRange(r[0], r[1]);
      }
      return this;
    } else {
      return this.subtract(new Range(value));
    }
  }

  subtractRange(min, max) {
    let newRange = [Math.max(0, min), max];
    if (newRange[0] > newRange[1]) {
      newRange = [newRange[1], newRange[0]];
    }
    const overlap = this.findOverlap(newRange);
    if (overlap.count > 0) {
      const remain = [];
      if (this.ranges[overlap.lo][0] < newRange[0]) {
        remain.push([this.ranges[overlap.lo][0], newRange[0] - 1]);
      }
      if (newRange[1] < this.ranges[overlap.lo + overlap.count - 1][1]) {
        remain.push([
          newRange[1] + 1,
          this.ranges[overlap.lo + overlap.count - 1][1]
        ]);
      }
      const array = this.ranges;
      array.splice.apply(array, [overlap.lo, overlap.count].concat(remain));
    }
    return this;
  }

  intersect(value) {
    if (value === undefined) {
      throw new TypeError(BAD_INPUT);
    } else if (value instanceof Range) {
      const result = [];
      let jstart = 0; // used for optimization
      for (let i = 0; i < this.ranges.length; i++) {
        const r1 = this.ranges[i];
        for (let j = jstart; j < value.ranges.length; j++) {
          const r2 = value.ranges[j];
          if (r1[0] <= r2[1] && r1[1] >= r2[0]) {
            jstart = j;
            const min = Math.max(r1[0], r2[0]);
            const max = Math.min(r1[1], r2[1]);
            result.push([min, max]);
          } else if (r1[1] < r2[0]) {
            break;
          }
        }
      }
      this.ranges = result;
      return this;
    } else {
      return this.intersect(new Range(value));
    }
  }

  findOverlap(target) {
    for (let hi = this.ranges.length - 1; hi >= 0; hi--) {
      const r = this.ranges[hi];
      let union = this.calcUnion(r, target);
      if (union) {
        let count = 1;
        let tmp = null;
        while ((hi - count >= 0) &&
            (tmp = this.calcUnion(union, this.ranges[hi - count]))) {
          union = tmp;
          count++;
        }
        // The given target touches or overlaps one or more of the existing ranges
        return { lo: hi + 1 - count, count, union };
      } else if (r[1] < target[0]) {
        // The given target does not touch nor overlap the existing ranges
        return { lo: hi + 1, count: 0, union: target };
      }
    }
    // The given target is smaller than the smallest existing range
    return { lo: 0, count: 0, union: target };
  }

  calcUnion(a, b) {
    if (a[1] + 1 < b[0] || a[0] - 1 > b[1]) {
      return null; // cannot make union
    }
    return [Math.min(a[0], b[0]), Math.max(a[1], b[1])];
  }

  getRanges() {
    const result = [];
    for (let i = 0; i < this.ranges.length; i++) {
      const r = this.ranges[i];
      result.push([r[0], r[1]]);
    }
    return result;
  }

  firstItem() {
    const ranges = this.getRanges();
    return ranges.length > 0 ? ranges[0][0] : 0;
  }

  lastItem() {
    const ranges = this.getRanges();
    if (ranges.length === 0) { return 0; }
    return ranges[ranges.length - 1][1];
  }

  has(value) {
    if (value === undefined) {
      throw new TypeError(BAD_INPUT);
    } else if (value instanceof Range) {
      const len = this.ranges.length;
      for (let i = 0; i < value.ranges.length; i++) {
        const tr = value.ranges[i];
        let ii = 0;
        for (; ii < len; ii++) {
          const my = this.ranges[ii];
          if (tr[0] >= my[0] && tr[1] <= my[1] &&
              tr[1] >= my[0] && tr[1] <= my[1]) {
            break;
          }
        }
        if (ii === len) { return false; }
      }
      return true;
    } else {
      return this.has(new Range(value));
    }
  }

  hasRange(min, max) {
    return this.has(new Range([[min, max]]));
  }

  isContinuous() {
    return this.ranges.length === 1;
  }

  length() {
    let result = 0;
    for (let i = 0; i < this.ranges.length; i++) {
      const r = this.ranges[i];
      result += r[1] - r[0] + 1;
    }
    return result;
  }

  equals(cmp) {
    if (cmp === undefined) {
      throw new TypeError(BAD_INPUT);
    } else if (cmp instanceof Range) {
      if (cmp === this) { return true; }
      if (this.ranges.length !== cmp.ranges.length) { return false; }
      for (let i = 0; i < this.ranges.length; i++) {
        if (this.ranges[i][0] !== cmp.ranges[i][0] ||
            this.ranges[i][1] !== cmp.ranges[i][1]) {
          return false;
        }
      }
      return true;
    } else {
      return this.equals(new Range(cmp));
    }
  }

  toString() {
    const ranges = [];
    for (let i = 0; i < this.ranges.length; i++) {
      const r = this.ranges[i];
      ranges.push(r[0] === r[1] ? String(r[0]) : `${r[0]}-${r[1]}`);
    }
    return ranges.join(', ');
  }

  toArray() {
    const result = new Array(this.length());
    let idx = 0;
    for (let i = 0; i < this.ranges.length; i++) {
      const r = this.ranges[i];
      for (let n = r[0]; n <= r[1]; n++) {
        result[idx++] = n;
      }
    }
    return result;
  }

}
