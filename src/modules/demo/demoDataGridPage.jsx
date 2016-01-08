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
import { t } from 'i18n/lookup.js';
import DataGrid, { CustomCell } from 'dataGrid.jsx';
import FetchToolbar from 'fetchToolbar.jsx';
import ResponsiveBox from 'responsiveBox.jsx';
import Box from 'grommet/components/Box';

class DemoDataGridPage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    demo: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.cols = [
      {
        columnKey: 'id',
        header: t('id'),
        width: 300,
        align: 'center',
        flexGrow: 1,
        cell: this._onCustomCell,
      },
      {
        columnKey: 'text',
        header: t('text'),
        width: 200,
        flexGrow: 1
      },
    ];
  }

  componentDidMount() {
    this.props.actions.demo.fetchIfNeeded();
  }

  _onRefresh = () => {
    this.props.actions.demo.fetchIfNeeded();
  };

  componentWillReceiveProps(nextProps) {
    const demo = nextProps.demo;
    this.props.actions.toolbar.set(
      <FetchToolbar
          isFetching={demo.isFetching}
          error={demo.lastError}
          date={demo.lastUpdate}
          onRefresh={this._onRefresh}/>
    );
  }

  componentWillUnmount() {
    this.props.actions.toolbar.clear();
  }

  _onCustomCell = (cellData, cellProps, colProps) => {
    return (
      <CustomCell {...cellProps}>
        {cellData}
        <i>{
          ` (rowIndex: ${cellProps.rowIndex}, columnKey: ${colProps.columnKey})`
        }</i>
      </CustomCell>
    );
  };

  _onEdit = (selection) => {
    alert(selection);
  };

  render() {
    const demoProps = this.props.demo;
    return (
      <Box className="flex1">
        Stuff can go here.
        <p/>
        <ResponsiveBox>
          <DataGrid width={300} height={400}
              data={demoProps.entities}
              columns={this.cols}
              noSelect
          />
        </ResponsiveBox>
      </Box>
    );
  }

}

const select = (state) => ({ demo: state.demo });

export default connect(select)(DemoDataGridPage);
