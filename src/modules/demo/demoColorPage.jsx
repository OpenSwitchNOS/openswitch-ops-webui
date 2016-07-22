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

import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import Box from 'grommet/components/Box';
import { navLogo } from 'brandLogoOps.jsx';

class DemoColorPage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    demo: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  _mkBox(color) {
    return (
      <Box direction="row" align="center" colorIndex={color}>
        {navLogo}colorIndex="{color}"
      </Box>
    );
  }

  render() {
    return (
      <Box pad={{horizontal: 'medium', vertical: 'medium'}} className="pageBox">
        {this._mkBox('neutral-1')}
        {this._mkBox('neutral-2')}
        {this._mkBox('neutral-3')}
        {this._mkBox('neutral-4')}
        {this._mkBox('accent-1')}
        {this._mkBox('accent-2')}
        {this._mkBox('accent-3')}
        {this._mkBox('graph-1')}
        {this._mkBox('graph-2')}
        {this._mkBox('graph-3')}
        {this._mkBox('graph-4')}
        {this._mkBox('graph-5')}
        {this._mkBox('graph-6')}
        {this._mkBox('graph-7')}
        {this._mkBox('graph-8')}
        {this._mkBox('graph-9')}
      </Box>
    );
  }

}

const select = (store) => ({ demo: store.demo });

export default connect(select)(DemoColorPage);
