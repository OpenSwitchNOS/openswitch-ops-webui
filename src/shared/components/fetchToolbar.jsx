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
import TimeAgo from 'react-timeago';
import RefreshIcon from 'grommet/components/icons/base/Refresh';


export default class FetchToolbar extends Component {

  static propTypes = {
    date: PropTypes.number,
    isFetching: PropTypes.bool,
    onRefresh: PropTypes.func,
    spin: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const p = this.props;

    const status = p.isFetching || !p.date ? null : (
      <small><TimeAgo date={p.date}/>&nbsp;</small>
    );

    const cls = this.props.spin && this.props.isFetching
      ? 'mHalf spin' : 'mHalf';
    const refresh = (
      <a onClick={this.props.onRefresh}>
        <RefreshIcon className={cls}/>
      </a>
    );

    return (
      <div>
        {status}
        {refresh}
      </div>
    );
  }

}
