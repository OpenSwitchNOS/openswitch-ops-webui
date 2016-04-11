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

//TODO - clean up - Reactor mock data into module directories

import CollectorDux from 'collector/collectorDux.js';
import SyslogDux from 'syslog/syslogDux.jsx';
import OverviewDux from 'overview/overviewDux.jsx';
import InterfaceDux from 'interface/interfaceDux.jsx';
import VlanDux from 'vlan/vlanDux.jsx';
import AgentMock from 'superagent-mock';
import Agent from 'agent.js';

const modules = [
  CollectorDux,
  OverviewDux,
  InterfaceDux,
  VlanDux,
  SyslogDux,
];

import * as i18nLocale from 'i18n/en-US.js';

const IDENTIFIERS = [
  'ops-switchd',
  'ops-lacpd',
  'ops-portd',
  'ops-zebra',
  'ovsdb-server',
  'vtysh',
  'lldp',
  'systemd'
];
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

function genData() {
  const entries = {};
  genSomeData(entries, 'min', 1, 20);
  genSomeData(entries, 'hour', 20, 40);
  genSomeData(entries, 'day', 40, 60);
  return entries;
}

function getSyslog(queries) {
  const syslogData = genData();
  const data = {};
  let idx = 1;
  const q = queries.split('&');
  const priority = q[0].split('=')[1];
  const since = q[1].split('=')[1];
  for (const key in syslogData) {
    if (syslogData[key].date < since) {
      continue;
    }

    if (syslogData[key].severity <= priority) {
      data[idx++] = syslogData[key];
    }
  }
  return data;
}

const config = [{
  pattern: 'https://test.com/rest/v1/system(.*)\\?(.*)',
  fixtures: match => {
    if (match[1] === '/syslogs') {
      return getSyslog(match[2]);
    }
    if (match[1] === '/data2') {
      return 'DATA2';
    }
    if (match[1] === '/e404') {
      throw new Error(404);
    }
  },
  get: (match, data) => { return { body: data }; }
}];

AgentMock(Agent.request, config);

const settings = {
  i18nLocale,
  reduxLogger: true,
  agent: {
    prefix: 'https://test.com',
  }
};

export default { modules, settings };
