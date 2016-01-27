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
import Button from 'grommet/components/Button';
import ResponsiveBox from 'responsiveBox.jsx';
import DataGrid, { CustomCell } from 'dataGrid.jsx';
import SpanStatus from 'spanStatus.jsx';


class SyslogPage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    syslog: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.cols = [
      {
        columnKey: 'severity',
        header: '',
        width: 10,
        flexGrow: 1,
        align: 'left',
        cell: this._onIconCell,
      },
      {
        columnKey: 'severity',
        header: t('severity'),
        width: 10,
        flexGrow: 1,
        align: 'left',
        cell: this._onSeverityCell,
      },
      { columnKey: 'date', header: t('date'), width: 100, flexGrow: 1 },
      { columnKey: 'facility', header: t('facility'), width: 20, flexGrow: 1 },
      { columnKey: 'text', header: t('text'), width: 200, flexGrow: 1 },
    ];
    this.state = {};
  }

  componentDidMount() {
    this.props.actions.syslog.fetch('vlans');
    this.props.actions.toolbar.setFetchTB(this.props.syslog, this._onRefresh);
  }

  _onRefresh = () => {
    this.props.actions.syslog.fetch('vlans');
  };

  componentWillReceiveProps(nextProps) {
    this.props.actions.toolbar.setFetchTB(nextProps.syslog, this._onRefresh);
  }

  componentWillUnmount() {
    this.props.actions.toolbar.clear();
  }

  _onIconCell = (cellData, cellProps) => {
    let severity = 'ok';
    if (cellData >=0 && cellData <= 3) {        // Critical severity
      severity = 'critical';
    } else if (cellData >=4 && cellData <= 5) { // Warning severity
      severity = 'warning';
    } else {
      severity = 'ok';
    }
    return (
      <CustomCell {...cellProps}>
      <div><SpanStatus value={severity} /></div>
      </CustomCell>
    );
  };

  _onSeverityCell = (cellData, cellProps) => {
    let text = t('info');
    switch (cellData) {
      case 0:
        text = t('emerg');
        break;
      case 1:
        text = t('alert');
        break;
      case 2:
        text = t('critical');
        break;
      case 3:
        text = t('error');
        break;
      case 4:
        text = t('warning');
        break;
      case 5:
        text = t('notice');
        break;
      case 6:
        text = t('info');
        break;
      case 7:
        text = t('debug');
        break;
      default:
        text = t('info');
        break;
    }

    return (
      <CustomCell {...cellProps}>
      {text}
      </CustomCell>
    );
  };

  _onClick = () => {
    this.props.actions.syslog.fetch('vlans');
  };

  render() {
    const syslogProps = this.props.syslog;
    return (
      <Box className="flex1">
        <Box className="pageBox flex0auto">
          <div float="right" position="relative">
            <Button primary label={t('critical')} onClick={this._onClick.bind(this,
              t('critical'))} />
            <Button primary label={t('warning')} onClick={this._onClick.bind(this,
              t('warning'))} />
            <Button primary label={t('all')} onClick={this._onClick.bind(this,
              t('all'))} />
          </div>
        </Box>
        <Box className="flex1 mTopHalf mLeft">
          <ResponsiveBox>
            <DataGrid width={500} height={400}
                data={syslogProps.entities}
                columns={this.cols}
                noSelect
            />
          </ResponsiveBox>
        </Box>
      </Box>
    );
  }
}

function select(store) {
  return {
    syslog: store.syslog,
  };
}

export default connect(select)(SyslogPage);
