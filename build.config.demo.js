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
import DemoDux from 'demo/demoDux.jsx';
import OverviewDux from 'overview/overviewDux.jsx';
import InterfaceDux from 'interface/interfaceDux.jsx';
import VlanDux from 'vlan/vlanDux.jsx';
import EcmpDux from 'ecmp/ecmpDux.jsx';
import LagDux from 'lag/lagDux.jsx';
import LogDux from 'log/logDux.jsx';

const modules = [
  CollectorDux,
  MonitorDux,
  DemoDux,
  OverviewDux,
  InterfaceDux,
  VlanDux,
  EcmpDux,
  LagDux,
  LogDux,
];

import ConfigInterfaceGuide from 'guides/configInterfaceGuide.jsx';
import ConfigLagGuide from 'guides/configLagGuide.jsx';
import ViewInterfacesGuide from 'guides/viewInterfacesGuide.jsx';

const guides = [
  ConfigInterfaceGuide,
  ConfigLagGuide,
  ViewInterfacesGuide,
];

import * as i18nLocale from 'i18n/en-US.js';

import { navLogo, loginLogo } from 'brandLogoOps.jsx';

import As5712 from 'boxGraphics/as5712.jsx';
import As6712 from 'boxGraphics/as6712.jsx';

const settings = {
  disableLogin: false,
  reduxLogger: true,

  AUTO_ACTIONS_INTERVAL: 10000,
  LAG_ID_RANGE: '1-2000',
  LAG_MAX_INTERFACES: 8,
  VLAN_ID_RANGE: '1-4094',

  i18nLocale,

  navLogo,
  loginLogo,
  logoText: 'OpenSwitch',

  boxGraphics: [ As5712, As6712 ],

  agent: {
    prefix: 'https://15.108.30.246',
  },

  extLinks: [
    {
      key: 'osApi',
      href: `http://15.108.30.248/api/index.html`
    },
    {
      key: 'osNet',
      href: 'http://openswitch.net'
    },
  ],
};

export default { modules, guides, settings };
