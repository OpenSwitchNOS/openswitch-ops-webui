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

import * as vlanDux from 'vlan/vlanDux.jsx';
import * as interfaceDux from 'interface/interfaceDux.jsx';
import * as syslogDux from 'syslog/syslogDux.jsx';
import * as demoDux from 'demo/demoDux.jsx';

const modules = [
  vlanDux,
  interfaceDux,
  syslogDux,
  demoDux,
];

import * as i18nLocale from 'i18n/en-US.js';

const settings = {
  i18nLocale,
  reduxLogger: true,
  agent: {
    prefix: 'http://15.108.30.248:8091',
  }
};

export default { modules, settings };
