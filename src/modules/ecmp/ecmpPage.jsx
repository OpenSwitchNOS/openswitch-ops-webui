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


class ECMPPage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    autoActions: PropTypes.object.isRequired,
    collector: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {};
    this.pad = {horizontal: 'small', vertical: 'small'};
  }

  componentDidMount() {
    this.props.autoActions.collector.fetch();
    this.props.actions.toolbar.setFetchTB(
      this.props.collector.overview,
      this._onRefresh
    );
  }

  _onRefresh = () => {
    this.props.autoActions.collector.fetch();
  };

  componentWillReceiveProps(nextProps) {
    this.props.actions.toolbar.setFetchTB(
      nextProps.collector.overview,
      this._onRefresh
    );
  }

  componentWillUnmount() {
    this.props.actions.toolbar.clear();
  }

  render() {
    const ecmp = this.props.collector.overview.ecmp;
    return (
      <Box className="flex1">
        <Box pad={this.pad} className="flex1 pageBox min200x400">
          <span><b>{t('ecmp')}: </b>{t(ecmp.enabled)}</span>
          <br/>
          <span><b>{t('resilientHash')}: </b>{t(ecmp.resilientHash)}</span>
          <br/>
          <br/>
          <b>{t('ecmp')} {t('loadBalance')}</b>
          <hr/>
          <table style={{tableLayout: 'fixed'}} className="propTable">
            <tbody>
              <tr>
                <td style={{width: '180px'}}>{t('srcIp')}:</td>
                <td>{t(ecmp.hashSrcIp)}</td>
              </tr>

              <tr>
                <td>{t('srcPort')}:</td>
                <td>{t(ecmp.hashSrcPort)}</td>
              </tr>

              <tr>
                <td>{t('dstIp')}:</td>
                <td>{t(ecmp.hashDstIp)}</td>
              </tr>

              <tr>
                <td>{t('dstPort')}:</td>
                <td>{t(ecmp.hashDstPort)}</td>
              </tr>
            </tbody>
          </table>
        </Box>
      </Box>
    );
  }

}

function select(store) {
  return {
    collector: store.collector,
  };
}

export default connect(select)(ECMPPage);
