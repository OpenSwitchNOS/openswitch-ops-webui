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
import AddIcon from 'grommet/components/icons/base/Add';
import SubIcon from 'grommet/components/icons/base/Subtract';


const MENU_TEXT = 'How to configure an interface...';

const COMPONENT = (
  <Box pad={{horizontal: 'small'}}>
    <b>Configure an interface</b>
    <ul>
      <li>For basic operation:</li>
      <ul>
        <li>Navigate to the page: <Anchor primary href="#/interface">Interfaces</Anchor></li>
        <li>Select an interface and click on <CfgIcon/> to bring up the edit panel.</li>
      </ul>
      <li>As part of a LAG:</li>
      <ul>
        <li>Navigate to the page: <Anchor primary href="#/lag">LAGs</Anchor></li>
        <li>To add a new LAG, click on <AddIcon/>.</li>
        <li>To delete a LAG, select a LAG and click on <SubIcon/>.</li>
        <li>To edit a LAG, select an interface and click on <CfgIcon/> to bring up the edit panel.</li>
      </ul>
    </ul>
  </Box>
);

export default {
  MENU_TEXT,
  COMPONENT,
};
