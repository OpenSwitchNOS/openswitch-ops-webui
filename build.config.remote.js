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

import CollectorDux from 'collector/collectorDux.js';
import MonitorDux from 'monitor/monitorDux.jsx';
import LogDux from 'log/logDux.jsx';
import OverviewDux from 'overview/overviewDux.jsx';
import InterfaceDux from 'interface/interfaceDux.jsx';
import VlanDux from 'vlan/vlanDux.jsx';
import EcmpDux from 'ecmp/ecmpDux.jsx';

const modules = [
  CollectorDux,
  MonitorDux,
  OverviewDux,
  InterfaceDux,
  VlanDux,
  LogDux,
  EcmpDux,
];

import * as i18nLocale from 'i18n/en-US.js';
import As5712 from 'boxGraphics/as5712.jsx';

const settings = {
  i18nLocale,
  boxGraphic: As5712,
  reduxLogger: true,
  agent: {
    prefix: 'http://15.108.30.248:8091',
  }
};

export default { modules, settings };