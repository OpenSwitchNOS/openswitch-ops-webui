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
import Box from 'grommet/components/Box';
import ResponsiveBox from 'responsiveBox.jsx';
import DataGrid, { CustomCell } from 'dataGrid.jsx';
import SpanStatus from 'spanStatus.jsx';


class LogPage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    autoActions: PropTypes.object.isRequired,
    collector: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.cols = [
      {
        columnKey: 'id',
        header: t('id'),
        width: 100,
      },
      {
        columnKey: 'ts',
        header: t('time'),
        width: 140,
        format: x => new Date(x).toLocaleTimeString(),
      },
      {
        columnKey: 'sev',
        header: t('severity'),
        cell: this._onCustomCell,
        width: 140,
      },
      {
        columnKey: 'msg',
        header: t('message'),
        flexGrow: 1,
        width: 100,
      },
    ];
    this.state = {};
  }

  _onCustomCell = (cellData, cellProps) => {
    return (
      <CustomCell {...cellProps}>
        <SpanStatus value={cellData}>{t(cellData)}</SpanStatus>
      </CustomCell>
    );
  };

  _onRefresh = () => {
    this.props.autoActions.collector.fetch();
  };

  componentDidMount() {
    this.props.autoActions.collector.fetch();
    this.props.actions.toolbar.setFetchTB(
      this.props.collector.overview, this._onRefresh
    );
  }

  componentWillReceiveProps(nextProps) {
    this.props.actions.toolbar.setFetchTB(
      nextProps.collector.overview, this._onRefresh
    );
  }

  componentWillUnmount() {
    this.props.actions.toolbar.clear();
  }

  render() {
    const logs = this.props.collector.overview.log.entries;
    return (
      <Box className="flex1 mTopHalf mLeft">
        <ResponsiveBox>
          <DataGrid width={400} height={400}
              data={logs}
              columns={this.cols}
              noSelect
          />
        </ResponsiveBox>
      </Box>
    );
  }

}

function select(store) {
  return {
    collector: store.collector,
  };
}

export default connect(select)(LogPage);
