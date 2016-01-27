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

import Table from 'grommet/components/Table';
import Box from 'grommet/components/Box';


class DemoTablePage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    demo: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = { search: '' };
  }

  _onMultipleSelect = () => {
  };

  render() {

    const tableHeader = (
      <thead>
        <tr>
          <th><a>header 1</a></th>
          <th>header 2</th>
        </tr>
      </thead>
    );

    const tableBody = (
      <tbody>
        <tr>
          <td>first</td>
          <td>note 1</td>
        </tr>
        <tr>
          <td>second</td>
          <td>note 2</td>
        </tr>
        <tr>
          <td>third</td>
          <td>note 3</td>
        </tr>
      </tbody>
    );

    return (
      <Box className="pageBox">
        <Table selectable="multiple" onSelect={this._onMultipleSelect}>
          {tableHeader}
          {tableBody}
        </Table>
      </Box>
    );
  }

}

const select = (store) => ({ demo: store.demo });

export default connect(select)(DemoTablePage);
