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
import FetchInfo from 'fetchInfo.jsx';


class SyslogPage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    syslog: PropTypes.object.isRequired,
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
    this.props.actions.syslog.fetchIfNeeded();
  }

  _onClick = () => {
    this.props.actions.syslog.readAll();
  }

  render() {
    const syslogProps = this.props.syslog;

    return (
      <Box className="flex1">
        <FetchInfo {...syslogProps}/>
        <p/>
        <Button primary label={t('readAll')} onClick={this._onClick} />
        <p/>
        <ResponsiveBox>
          <DataGrid width={500} height={400}
              data={syslogProps.entities}
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
    syslog: state.syslog,
  };
}

export default connect(select)(SyslogPage);
