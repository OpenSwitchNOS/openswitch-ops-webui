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
import FetchToolbar from 'fetchToolbar.jsx';


class MonitorInterfacePage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    autoActions: PropTypes.object.isRequired,
    children: PropTypes.node,
    collector: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.pad = {horizontal: 'small', vertical: 'small'};
  }

  _setToolbar = (props) => {
    const collector = props.collector;
    this.props.actions.toolbar.set(
      <FetchToolbar
          isFetching={collector.isFetching}
          error={collector.lastError}
          date={collector.lastUpdate}
          onRefresh={this._onRefresh}
      />
    );
  };

  componentDidMount() {
    this.props.autoActions.collector.fetch();
    this.props.actions.toolbar.setFetchTB(
      this.props.collector.overview, this._onRefresh
    );
  }

  _onRefresh = () => {
    this.props.autoActions.collector.fetch();
  };

  componentWillReceiveProps(nextProps) {
    this.props.actions.toolbar.setFetchTB(
      nextProps.collector.overview, this._onRefresh
    );
  }

  componentWillUnmount() {
    this.props.actions.toolbar.clear();
  }

  render() {
    return (
      <Box className="flex1">
        {this.props.children}
      </Box>
    );
  }

}

function select(store) {
  return {
    collector: store.collector,
  };
}

export default connect(select)(MonitorInterfacePage);
