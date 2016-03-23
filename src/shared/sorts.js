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


const NUMBER_GROUPS = /(-?\d*\.?\d+)/g;

export function naturalSort(a, b) {
  const aa = String(a).split(NUMBER_GROUPS);
  const bb = String(b).split(NUMBER_GROUPS);
  const min = Math.min(aa.length, bb.length);

  for (let i = 0; i < min; i++) {
    const x = parseFloat(aa[i]) || aa[i].toLowerCase();
    const y = parseFloat(bb[i]) || bb[i].toLowerCase();
    if (x < y) {
      return -1;
    } else if (x > y) {
      return 1;
    }
  }
  return 0;
}
