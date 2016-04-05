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

import _ from 'lodash';


export function utilization(prevBytes, currBytes, speed, intervalMillis) {

  if (isNaN(prevBytes) || isNaN(currBytes) || isNaN(speed) ||
      isNaN(intervalMillis) || speed <= 0 || currBytes < prevBytes ||
      intervalMillis <= 0) {

    return 0;
  }

  const maxBytesPerSec = speed / 8;
  const bytesPerSec = (currBytes - prevBytes) / (intervalMillis / 1000);
  const result = 100 * (bytesPerSec / maxBytesPerSec);

  return (result > 100) ? 100 : result;
}

export function sumValues(arrayOrObj, keysOrKey) {
  const array = Array.isArray(arrayOrObj) ? arrayOrObj : _.values(arrayOrObj);
  const keys = Array.isArray(keysOrKey) ? keysOrKey : [ keysOrKey ];
  const values = {};
  keys.forEach(key => values[key] = 0);

  if (Array.isArray(array)) {
    array.forEach(obj => {
      keys.forEach(key => {
        const s = obj[key];
        if (!isNaN(s)) {
          values[key] += s;
        }
      });
    });
  }
  return keys.length > 1 ? values : values[keys[0]];
}
