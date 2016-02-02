/*
 (C) Copyright 2016 Hewlett Packard Enterprise Development LP

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
import Menu from 'grommet/components/Menu';
import Anchor from 'grommet/components/Anchor';


const FILTER = {
  since: '',    // time in 12 digit long
  until: '',     // time in 12 digit long
  priority: '3'
};

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
      { columnKey: 'identifier', header: t('identifier'), width: 20, flexGrow: 1 },
      { columnKey: 'message', header: t('message'), width: 200, flexGrow: 1 },
    ];
    this.state = {};

    // Move inside to be able to use t()
    this.TimeRangeEnum = {
      LAST_HOUR: 0,
      LAST_24_HRS: 1,
      LST_7_DAYS: 2,
      properties: {
        0: {name: 'lastHour', value: 0, text: t('lastHour')},
        1: {name: 'last24hrs', value: 1, text: t('last24hrs')},
        2: {name: 'last7days', value: 2, text: t('last7days')}
      }
    };
    this.SyslogEnum = {
      EMERG: 0,
      ALERT: 1,
      CRIT: 2,
      ERROR: 3,
      WARNING: 4,
      NOTICE: 5,
      INFO: 6,
      DEBUG: 7,
      properties: {
        0: {name: 'emerg', value: 0, text: t('emerg')},
        1: {name: 'alert', value: 1, text: t('alert')},
        2: {name: 'critical', value: 2, text: t('critical')},
        3: {name: 'error', value: 3, text: t('error')},
        4: {name: 'warning', value: 4, text: t('warning')},
        5: {name: 'notice', value: 5, text: t('notice')},
        6: {name: 'info', value: 6, text: t('info')},
        7: {name: 'debug', value: 7, text: t('debug')}
      }
    };
    this.SeverityEnum = {
      CRITICAL: 0,
      WARNING: 1,
      INFO: 2,
      properties: {
        0: {name: 'critical', value: 0, text: t('critical')},
        1: {name: 'warning', value: 1, text: t('warning')},
        2: {name: 'info', value: 2, text: t('info')}
      }
    };

    this.sev = this.SyslogEnum.DEBUG; // this.syslogEnum.DEBUG is not accessible here?
    this.time = 0;
  }

  // Return date as a long in millisecs
  _getsince = (fromDate, timeAgo) => {
    const d = new Date(fromDate);
    switch (timeAgo) {
      case this.TimeRangeEnum.LAST_HOUR:
        d.setMinutes(d.getMinutes() - 60);
        break;
      case this.TimeRangeEnum.LAST_24_HRS:
        d.setHours(d.getHours() - 24);
        break;
      case this.TimeRangeEnum.LAST_7_DAYS:
        d.setDate(d.getDate() - 7);
        break;
      default:
        break;
    }
    return d.getTime();
  };

  _buildFilter = () => {
    const url = FILTER;
    url.priority = this.sev;
    url.until = new Date().getTime();
    url.since = this._getsince(url.until, this.time);
    return url;
  };

  componentDidMount() {
    this.props.actions.syslog.fetch(this._buildFilter());
    this.props.actions.toolbar.setFetchTB(this.props.syslog, this._onRefresh);
  }

  _onRefresh = () => {
    this.props.actions.syslog.fetch(this._buildFilter());
  };

  componentWillReceiveProps(nextProps) {
    this.props.actions.toolbar.setFetchTB(nextProps.syslog, this._onRefresh);
  }

  componentWillUnmount() {
    this.props.actions.toolbar.clear();
  }

  _onIconCell = (cellData, cellProps) => {
    let severity = 'ok';
    if (cellData >= this.SyslogEnum.EMERG &&
      cellData <= this.SyslogEnum.ERROR) {
      severity = 'critical';
    } else if (cellData >= this.SyslogEnum.WARNING &&
      cellData <= this.SyslogEnum.NOTICE) {
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
    let v = cellData;
    if (v < this.SyslogEnum.EMERG || v > this.SyslogEnum.DEBUG) {
      v = this.SyslogEnum.DEBUG;
    }
    return (
      <CustomCell {...cellProps}>
        {this.SyslogEnum.properties[v].text}
      </CustomCell>
    );
  };

  _onTimeClick = (event) => {
    this.time = event;
    this.props.actions.syslog.fetch(this._buildFilter());
  };

  _onSeverityClick = (event) => {
    switch (event) {
      case this.SeverityEnum.INFO:
        this.sev = this.SyslogEnum.DEBUG;
        break;
      case this.SeverityEnum.WARNING:
        this.sev = this.SyslogEnum.NOTICE;
        break;
      default:
        this.sev = this.SyslogEnum.ERROR;
        break;
    }
    this.props.actions.syslog.fetch(this._buildFilter());
  };

  _onClick = () => {
    this.props.actions.syslog.fetch(this._buildFilter());
  };

  render() {
    const syslogProps = this.props.syslog;
    return (
      <Box className="flex1">
        <Box className="pageBox flex0auto">
          <div float="right" position="relative">
              <Menu label={this.props.syslog.timeLabel} responsive
                  selectable inline="false" >
                <Anchor href="/#/syslog"
                    onClick={this._onTimeClick.bind(this,
                      this.TimeRangeEnum.LAST_HOUR)}>
                  {this.TimeRangeEnum.properties[this.TimeRangeEnum.LAST_HOUR].text}
                </Anchor>
                <Anchor href="/#/syslog"
                    onClick={this._onTimeClick.bind(this,
                        this.TimeRangeEnum.LAST_24_HRS)}>
                  {t('last24hrs')}
                </Anchor>
                <Anchor href="/#/syslog"
                    onClick={this._onTimeClick.bind(this,
                      this.TimeRangeEnum.LAST_7_DAYS)}>
                  {t('last7days')}
                </Anchor>
              </Menu>
            <Button primary label={t('critical')}
                onClick={this._onSeverityClick.bind(this,
                  this.SeverityEnum.CRITICAL)} />
            <Button primary label={t('warning')}
                onClick={this._onSeverityClick.bind(this,
                  this.SeverityEnum.WARNING)} />
            <Button primary label={t('info')}
                onClick={this._onSeverityClick.bind(this,
                  this.SeverityEnum.INFO)} />
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
