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

export function tl(val, mapping, notFoundVal) {
  const mapVal = mapping[val];
  return mapVal || notFoundVal || 'unknown';
}

export function tlVlanOperState(val) {
  return tl(val, {
    up: 'up',
    down: 'down'
  });
}

export function tlVlanOperStateReason(val) {
  return tl(val, {
    ok: 'ok',
    'admin_down': 'adminDown',
    'no_member_port': 'noMemberPort',
  });
}

export function tlPortVlanMode(val) {
  return tl(val, {
    'trunk': 'trunk',
    'access': 'access',
    'native-tagged': 'nativeTagged',
    'native-untagged': 'nativeUntagged',
  });
}
