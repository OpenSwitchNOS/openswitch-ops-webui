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
import DataGrid from 'dataGrid.jsx';
import FetchToolbar from 'fetchToolbar.jsx';


class OverviewPage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    overview: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.cols = [
      { columnKey: 'id', header: t('id'), width: 100 },
      { columnKey: 'text', header: t('text'), width: 200, flexGrow: 1 },
    ];
    this.state = {};
  }

  componentDidMount() {
    this.props.actions.overview.fetchIfNeeded();
  }

  _onRefresh = () => {
    this.props.actions.overview.fetchIfNeeded();
  }

  componentWillReceiveProps(nextProps) {
    const overview = nextProps.overview;
    this.props.actions.toolbar.set(
      <FetchToolbar
          isFetching={overview.isFetching}
          error={overview.lastError}
          date={overview.lastUpdate}
          onRefresh={overview._onRefresh}/>
    );
  }

  componentWillUnmount() {
    this.props.actions.toolbar.clear();
  }

  _onClick = () => {
    this.props.actions.overview.readAll();
  }

  render() {
    const overviewProps = this.props.overview;
    return (
      <Box className="flex1">
        <Button primary label={t('readAll')} onClick={this._onClick} />
        <p/>
        <ResponsiveBox>
          <DataGrid width={500} height={400}
              data={overviewProps.entities}
              columns={this.cols}
              noSelect
          />
        </ResponsiveBox>
      </Box>
    );
  }

}

function select(state) {
  return {
    overview: state.overview,
  };
}

export default connect(select)(OverviewPage);
