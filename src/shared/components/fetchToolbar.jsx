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
import { t } from 'i18n/lookup.js';
import TimeAgo from 'react-timeago';
import SpanStatus from 'spanStatus.jsx';
import ErrorLayer from 'errorLayer.jsx';
import RefreshIcon from 'grommet/components/icons/base/Refresh';


export default class FetchToolbar extends Component {

  static propTypes = {
    date: PropTypes.number,
    error: PropTypes.shape({
      url: PropTypes.string,
      status: PropTypes.number,
      message: PropTypes.string,
    }),
    isFetching: PropTypes.bool,
    onRefresh: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  _onStatusClicked = () => {
    this.setState({ showDetail: true });
  };

  _onCloseDetail = () => {
    this.setState({ showDetail: false });
  };

  render() {
    const p = this.props;

    let status = null;
    let detail = null;

    if (!p.isFetching) {
      if (p.error) {
        status = (
          <SpanStatus onClick={this._onStatusClicked} value="critical">
            {t('failedRequest')}
          </SpanStatus>
        );
        if (this.state.showDetail) {
          detail = (
            <ErrorLayer
                title={t('failedRequest')}
                error={p.error}
                onClose={this._onCloseDetail}
            />
          );
        }
      } else if (p.date) {
        status = <small><TimeAgo date={p.date}/>&nbsp;</small>;
      }
    }

    const refresh = (
      <a onClick={this.props.onRefresh}>
        <RefreshIcon className={p.isFetching ? 'spin mHalf' : 'mHalf'}/>
      </a>
    );

    return (
      <div>
        {status}
        {refresh}
        {detail}
      </div>
    );
  }

}
