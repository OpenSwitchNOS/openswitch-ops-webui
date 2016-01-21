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
import DataGrid from 'dataGrid.jsx';
import FetchToolbar from 'fetchToolbar.jsx';


class InterfacePage extends Component {

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
        align: 'right',
      },
      {
        columnKey: 'adminState',
        header: t('state'),
        width: 100,
      },
    ];
    this.state = {};
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
    this._setToolbar(this.props);
  }

  _onRefresh = () => {
    this.props.autoActions.collector.fetch();
  };

  componentWillReceiveProps(nextProps) {
    this._setToolbar(nextProps);
  }

  componentWillUnmount() {
    this.props.actions.toolbar.clear();
  }

  render() {
    const interfaces = this.props.collector.interfaces.entities;
    return (
      <Box className="mLeft flex1">
        <Box className="pageBox mLeft0 min200x200">
          ...BoxGraphic goes here...
        </Box>
        <ResponsiveBox>
          <DataGrid width={300} height={400}
              data={interfaces}
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

export default connect(select)(InterfacePage);
