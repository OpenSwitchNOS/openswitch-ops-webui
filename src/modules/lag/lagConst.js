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

export const AGGR_MODE = 'lacp';
export const AGGR_MODE_ACTIVE = 'active';
export const AGGR_MODE_PASSIVE = 'passive';
export const AGGR_MODE_OFF = 'off';
export const AGGR_MODE_DEF = AGGR_MODE_OFF;

export const OTHER_CFG = 'other_config';

export const RATE = 'lacp-time';
export const RATE_SLOW = 'slow';
export const RATE_FAST = 'fast';
export const RATE_DEF = RATE_SLOW;

export const FALLBACK = 'lacp-fallback-ab';
export const FALLBACK_DEF = 'false';

export const HASH = 'bond_mode';
export const HASH_L3 = 'l3-src-dst';
export const HASH_L2 = 'l2-src-dst';
export const HASH_L2_VID = 'l2vid-src-dst';
export const HASH_L4 = 'l4-src-dst';
export const HASH_DEF = HASH_L3;

export function copyWithoutDefs(oc) {
  const ocCopy = { ...oc };
  if (oc[RATE] === RATE_DEF) { delete ocCopy[RATE]; }
  if (oc[FALLBACK] === FALLBACK_DEF) { delete ocCopy[FALLBACK]; }
  if (oc[HASH] === HASH_DEF) { delete ocCopy[HASH]; }
  return ocCopy;
}

export const LACP_AGGR_KEY = 'lacp-aggregation-key';
