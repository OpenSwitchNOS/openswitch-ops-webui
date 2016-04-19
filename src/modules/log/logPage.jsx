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
import Menu from 'grommet/components/Menu';
import Anchor from 'grommet/components/Anchor';
import { mkStatusLayer } from 'asyncStatusLayer.jsx';


// TODO: This really should be changed to timestamps on the back end.
const LAST_HOUR = '1 hour ago';
const LAST_24_HRS = '24 hour ago';
const LAST_7_DAYS = '7 day ago';

const T_CRIT = 3; // Critical only
const T_WARN = 4; // Warning and Critical
const T_ALL = 7;  // Info, Warning and Critical


class LogPage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    log: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.cols = [
      {
        columnKey: 'ts',
        header: t('time'),
        width: 140,
      },
      {
        columnKey: 'sev',
        header: t('severity'),
        cell: this._onCustomCell,
        width: 140,
      },
      {
        columnKey: 'syslogId',
        header: t('identifier'),
        width: 140,
      },
      {
        columnKey: 'cat',
        header: t('category'),
        width: 140,
      },
      {
        columnKey: 'msg',
        header: t('message'),
        width: 100,
        flexGrow: 1,
        cell: this._onMsgCell,
      },
    ];
    this.state = { priority: T_CRIT, since: LAST_HOUR };
  }

  _onChange = (setting) => {
    const filter = { ...this.state, ...setting };
    this.setState(setting);
    this.props.actions.log.fetch(filter);
  };

  _onCustomCell = (cellData, cellProps) => {
    return (
      <CustomCell {...cellProps}>
        <SpanStatus value={cellData}>{t(cellData)}</SpanStatus>
      </CustomCell>
    );
  };

  _onMsgCell = (cellData, cellProps) => {
    return (
      <CustomCell title={cellData} {...cellProps}>
        {cellData}
      </CustomCell>
    );
  };

  componentDidMount() {
    const p = this.props;
    this._onRefresh();
    p.actions.toolbar.setFetchTB(p.log.asyncStatus, this._onRefresh);
  }

  _onRefresh = () => {
    this.props.actions.log.fetch(this.state);
  };

  componentWillReceiveProps(nextProps) {
    const p = nextProps;
    p.actions.toolbar.setFetchTB(p.log.asyncStatus, this._onRefresh);
  }

  componentWillUnmount() {
    this.props.actions.toolbar.clear();
  }

  render() {
    const data = this.props.log;
    const numEntries = Object.getOwnPropertyNames(data.entries).length;
    const limit = (numEntries === data.limit) ? ` - ${t('limitReached')}` : '';

    const title = `${t('total')}: ${numEntries}${limit}`;

    const since = this.state.since === LAST_HOUR ? t('lastHour') :
      this.state.since === LAST_24_HRS ? t('last24hrs') : t('last7days');

    const priority = this.state.priority === T_CRIT ? t('critOnly') :
      this.state.priority === T_WARN ? t('critAndWarn') : t('all');

    const statusLayer = mkStatusLayer(
      data.asyncStatus,
      this.props.actions.log.clearError);

    return (
      <Box className="flex1 mTop mLeft">
        {statusLayer}
        <ResponsiveBox>
          <DataGrid width={400} height={400}
              title={title}
              data={data.entries}
              columns={this.cols}
              noSelect
              toolbar={[
                <Menu key="logPri" label={priority}>
                  <Anchor
                      onClick={() => this._onChange({ priority: T_CRIT })}>
                    {t('critOnly')}
                  </Anchor>
                  <Anchor
                      onClick={() => this._onChange({ priority: T_WARN})}>
                    {t('critAndWarn')}
                  </Anchor>
                  <Anchor
                      onClick={() => this._onChange({ priority: T_ALL })}>
                    {t('all')}
                  </Anchor>
                </Menu>,
                <Menu key="logSince" label={since}>
                  <Anchor
                      onClick={() => this._onChange({ since: LAST_HOUR })}>
                    {t('lastHour')}
                  </Anchor>
                  <Anchor
                      onClick={() => this._onChange({ since: LAST_24_HRS })}>
                    {t('last24hrs')}
                  </Anchor>
                  <Anchor
                      onClick={() => this._onChange({ since: LAST_7_DAYS })}>
                    {t('last7days')}
                  </Anchor>
                </Menu>
              ]}
          />
        </ResponsiveBox>
      </Box>
    );
  }

}

function select(store) {
  return {
    log: store.log,
  };
}

export default connect(select)(LogPage);
