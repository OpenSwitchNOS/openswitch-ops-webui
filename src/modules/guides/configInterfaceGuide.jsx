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


import React from 'react';
import Box from 'grommet/components/Box';
import Anchor from 'grommet/components/Anchor';
import CfgIcon from 'grommet/components/icons/base/Configuration';


const MENU_TEXT = 'How to configure an interface...';

const COMPONENT = (
  <Box pad={{horizontal: 'small'}}>
    <b>Configure an Interface</b>
    <br/>
    <ul>
      <li>Navigate to the page:</li>
      <Anchor primary href="#/interface">Interfaces</Anchor>
      <li>Select an interface in the table.</li>
      <li>In the table header, click on the configuration icon:</li>
      <CfgIcon/>
      <li>Configure the interface attributes from within the slide-in pane.</li>
      <li><b>Deploy</b> the new configuration to the device.</li>
    </ul>
  </Box>
);

export default {
  MENU_TEXT,
  COMPONENT,
};
