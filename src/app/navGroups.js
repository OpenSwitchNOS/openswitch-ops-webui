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

// Modules don't specify group order.  The groups are created automatically
// when they are detected as a new parent of a link in the build config.
// Therefore, we need a way to specify an order for each group. The idea is
// that groups are few (or not used at all).

const GROUP_ORDER = {
  general: 1000,
  links: 2000,
};

const DEFAULT_ORDER = 9999;

export function orderForGroup(groupKey) {
  return GROUP_ORDER[groupKey] || DEFAULT_ORDER;
}