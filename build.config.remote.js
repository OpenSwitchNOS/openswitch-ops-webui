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
import OverviewDux from 'overview/overviewDux.jsx';
import InterfaceDux from 'interface/interfaceDux.jsx';
import EcmpDux from 'ecmp/ecmpDux.jsx';
import LagDux from 'lag/lagDux.jsx';
import VlanDux from 'vlan/vlanDux.jsx';

const modules = [
  CollectorDux,
  MonitorDux,
  OverviewDux,
  InterfaceDux,
  EcmpDux,
  LagDux,
  VlanDux,
];

import ConfigInterfaceGuide from 'guides/configInterfaceGuide.jsx';

const guides = [
  ConfigInterfaceGuide,
];

import * as i18nLocale from 'i18n/en-US.js';
import As5712 from 'boxGraphics/as5712.jsx';

const settings = {
  i18nLocale,
  boxGraphic: As5712,
  reduxLogger: true,
  agent: {
    prefix: 'http://15.108.30.248:8091',
  },
  extLinks: [
    {
      key: 'osApi',
      href: `http://15.108.30.248:8091/api/index.html`
    },
    {
      key: 'osNet',
      href: 'http://openswitch.net'
    },
  ],
  constants: {
    VLAN_ID_RANGE: '1-4094'
  }
};

export default { modules, guides, settings };