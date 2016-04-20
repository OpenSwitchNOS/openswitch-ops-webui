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
import { mkStatusLayer } from 'asyncStatusLayer.jsx';
import EditIcon from 'grommet/components/icons/base/Configuration';
import Anchor from 'grommet/components/Anchor';
import EcmpEdit from './ecmpEdit.jsx';

class EcmpPage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    ecmp: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {};
    this.pad = {horizontal: 'small', vertical: 'small'};
  }

  _onRefresh = () => {
    this.props.actions.ecmp.fetch();
  };

  componentDidMount() {
    const p = this.props;
    p.actions.ecmp.fetch();
    p.actions.toolbar.setFetchTB(p.ecmp.asyncStatus, this._onRefresh);
  }

  componentWillReceiveProps(nextProps) {
    const p = nextProps;
    p.actions.toolbar.setFetchTB(p.ecmp.asyncStatus, this._onRefresh);
  }

  componentWillUnmount() {
    this.props.actions.toolbar.clear();
  }

  _onCloseEcmpEdit = () => {
    this.setState({editEcmpShow: false});
  };

  _onEdit = () => {
    this.setState({editEcmpShow: true});
  };

  _onSubmitEcmpEdit= (ecmpDataObj) => {
    this.props.actions.ecmp.editEcmp(ecmpDataObj);
    this._onCloseEcmpEdit();
  };

  render() {
    const data = this.props.ecmp;

    const statusLayer = mkStatusLayer(
          this.props.ecmp.asyncStatus,
          this.props.actions.ecmp.clearError);

    const ecmpEdit = this.state.editEcmpShow ?
      <EcmpEdit
          onClose={this._onCloseEcmpEdit}
          onSubmit={this._onSubmitEcmpEdit}
      /> : null;

    return (
      <Box className="flex1">
        {statusLayer}
        <Anchor onClick={this._onEdit}>
          <EditIcon />
        </Anchor>
        <Box pad={this.pad} className="flex1 pageBox min200x400">
          <span><b>{t('ecmp')}: </b>{t(data.enabled)}</span>
          <br/>
          <span><b>{t('resilientHash')}: </b>{t(data.resilientHash)}</span>
          <br/>
          <br/>
          <b>{t('ecmp')} {t('loadBalance')}</b>
          <hr/>
          <table style={{tableLayout: 'fixed'}} className="propTable">
            <tbody>
              <tr>
                <td style={{width: '180px'}}>{t('srcIp')}:</td>
                <td>{t(data.hashSrcIp)}</td>
              </tr>

              <tr>
                <td>{t('srcPort')}:</td>
                <td>{t(data.hashSrcPort)}</td>
              </tr>

              <tr>
                <td>{t('dstIp')}:</td>
                <td>{t(data.hashDstIp)}</td>
              </tr>

              <tr>
                <td>{t('dstPort')}:</td>
                <td>{t(data.hashDstPort)}</td>
              </tr>
            </tbody>
          </table>
          {ecmpEdit}
        </Box>
      </Box>
    );
  }

}

function select(store) {
  return {
    ecmp: store.ecmp,
  };
}

export default connect(select)(EcmpPage);
