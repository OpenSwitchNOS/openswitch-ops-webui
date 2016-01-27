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

class DemoBoxPage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    demo: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {};
    this.pad = {horizontal: 'small', vertical: 'small'};
  }

  render() {
    return (
      <Box className="flex1">
        <Box pad={this.pad} className="flex0 pageBox min200x400">
          <b>Box</b>Row1 (min 200x400)
        </Box>
        <Box pad={this.pad} className="flex1 pageBox min200x400">
          <b>Box</b>Row2 (min 200x400)
          <br/>
          This page consists of a top-level Box (column) with 2 rows.
          The first (top) row contains a single Box that will not expand
          vertically. The second (bottom) row contains a single expanding Box.
          <br/>
          Each Box should have similar background color and styling. There
          should be even gaps between the Boxes and between the Boxes and the
          page edges at all times.
        </Box>
      </Box>
    );
  }

}

const select = (store) => ({ demo: store.demo });

export default connect(select)(DemoBoxPage);
