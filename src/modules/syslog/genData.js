/*
 (C) Copyright 2016 Hewlett Packard Enterprise Development LP

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

const IDENTIFIERS = ['ops-switchd', 'ops-lacpd', 'ops-portd', 'ops-zebra',
'ovsdb-server', 'vtysh', 'lldp', 'systemd'];
const TEXT= 'This is syslog with severity :';


// Generate random older date by type of minute, hour, and day
function getOlderDate(type) {
  const myDate = new Date();
  let v;
  switch (type) {
    case 'min':
      v = Math.floor((Math.random() * 60) + 1);
      myDate.setMinutes(myDate.getMinutes() - v);
      break;
    case 'hour':
      v = Math.floor((Math.random() * 24) + 1);
      myDate.setHours(myDate.getHours() - v);
      break;
    case 'day':
    default:
      v = Math.floor((Math.random() * 7) + 1);
      myDate.setDate(myDate.getDate() - v);
      break;
  }
  return myDate.toISOString();
}

function genSomeData(entries, type, i, uptoIdx) {
  let entry;
  let idx = i;
  while (idx < uptoIdx) {
    entry = {};
    entry.severity = (Math.floor((Math.random() * 8) + 1))%8;
    entry.date = getOlderDate(type);
    entry.identifier = IDENTIFIERS[(Math.floor((Math.random() * 8) + 1))%8];
    entry.message = TEXT + entry.severity;
    entries[idx++] = entry;
  }
}

export function genData() {
  const entries = {};
  genSomeData(entries, 'min', 1, 20);
  genSomeData(entries, 'hour', 20, 40);
  genSomeData(entries, 'day', 40, 60);
  return entries;
}
