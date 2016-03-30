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


const MENU_TEXT = 'Device graphic legend...';

const COMPONENT = (
  <Box pad={{horizontal: 'small'}}>
    <b>Device graphic legend</b>
    <ul>
      <li>Navigate to the page: <Anchor primary href="#/interface">Interfaces</Anchor></li>
      <li>Each interface box may contain:</li>
    </ul>
    <table>
      <tbody>
        <tr>
          <td>
            <div
                className="rotate45"
                style={{paddingTop: '4px', paddingLeft: '8px', color: '#A00', fontSize: '30px'}}>
              /
            </div>
          </td>
          <td><i>forward slash</i></td>
          <td><b>Admin State</b> is <b>Down</b></td>
        </tr>
        <tr>
          <td>
            <div
                style={{width: '20px', height: '20px', backgroundColor: '#0F0'}}>
            </div>
          </td>
          <td><i>filled rectangle</i></td>
          <td><b>Link State</b> is <b>Up</b></td>
        </tr>
      </tbody>
    </table>
  </Box>
);

export default {
  MENU_TEXT,
  COMPONENT,
};
