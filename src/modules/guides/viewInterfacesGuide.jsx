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

const SPLIT_DOT = {display: 'inline-block', width: '12px', height: '12px', borderRadius: '6px', border: '2px solid grey', backgroundColor: 'grey'};

const SPLIT_SUPPORTED = { ...SPLIT_DOT };
const SPLIT = { ...SPLIT_DOT, borderColor: '#0A0'};
const SPLIT_LINK = { ...SPLIT_DOT, backgroundColor: '#0F0', borderColor: '#0A0'};
const SPLIT_ADMIN_DOWN = { ...SPLIT_DOT, borderColor: '#F00'};

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
                style={{paddingTop: '4px', paddingLeft: '16px', color: '#A00', fontSize: '30px'}}>
              /
            </div>
          </td>
          <td><i>red slash</i></td>
          <td>Admin State is <b>Down</b></td>
        </tr>
        <tr>
          <td>
            <div
                style={{width: '20px', height: '20px', marginLeft: '12px', backgroundColor: '#0F0'}}>
            </div>
          </td>
          <td><i>green box</i></td>
          <td>Link State is <b>Up</b></td>
        </tr>
        <tr>
          <td style={{width: '64px'}}>
            <div
                style={SPLIT_SUPPORTED}>
            </div>
            <div
                style={SPLIT_SUPPORTED}>
            </div>
            <div
                style={SPLIT_SUPPORTED}>
            </div>
            <div
                style={SPLIT_SUPPORTED}>
            </div>
          </td>
          <td><i>grey</i></td>
          <td>Split Interfaces are <b>Supported</b></td>
        </tr>
        <tr>
          <td>
            <div
                style={SPLIT}>
            </div>
            <div
                style={SPLIT}>
            </div>
            <div
                style={SPLIT}>
            </div>
            <div
                style={SPLIT}>
            </div>
          </td>
          <td><i>green outline</i></td>
          <td>Split Interfaces are <b>Enabled</b></td>
        </tr>
        <tr>
          <td>
            <div
                style={SPLIT}>
            </div>
            <div
                style={SPLIT_LINK}>
            </div>
            <div
                style={SPLIT}>
            </div>
            <div
                style={SPLIT}>
            </div>
          </td>
          <td><i>green</i></td>
          <td>Split Interface Link State is <b>Up</b></td>
        </tr>
        <tr>
          <td>
            <div
                style={SPLIT}>
            </div>
            <div
                style={SPLIT_ADMIN_DOWN}>
            </div>
            <div
                style={SPLIT}>
            </div>
            <div
                style={SPLIT}>
            </div>
          </td>
          <td><i>red outline</i></td>
          <td>Split Interface Admin State is <b>Down</b></td>
        </tr>
      </tbody>
    </table>
  </Box>
);

export default {
  MENU_TEXT,
  COMPONENT,
};
