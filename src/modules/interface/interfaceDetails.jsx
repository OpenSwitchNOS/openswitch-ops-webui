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
import Header from 'grommet/components/Header';
import Menu from 'grommet/components/Menu';
import Title from 'grommet/components/Title';
import Anchor from 'grommet/components/Anchor';
import Box from 'grommet/components/Box';
import CloseIcon from 'grommet/components/icons/base/Close';
import EditIcon from 'grommet/components/icons/base/Edit';
import RefreshIcon from 'grommet/components/icons/base/Refresh';
import ErrorLayer from 'errorLayer.jsx';
import InterfaceEdit from './interfaceEdit.jsx';
import _ from 'lodash';


class InterfaceDetails extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    autoActions: PropTypes.object.isRequired,
    collector: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    interface: PropTypes.object.isRequired,
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.fid = _.uniqueId('infForm_');
    this.state = {
      editMode: false,
    };
  }

  _id = s => `${this.fid}_${s}`;

  componentDidMount() {
    this.props.actions.interface.fetchDetails(this.props.params.id);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.interface.set.lastSuccessMillis >
        this.props.interface.set.lastSuccessMillis) {

      this.props.actions.collector.fetchImmediate();

    } else if (nextProps.params.id !== this.props.params.id ||
        nextProps.collector.overview.lastSuccessMillis >
        this.props.collector.overview.lastSuccessMillis) {

      this.props.actions.interface.fetchDetails(nextProps.params.id);
    }
  }

  _onClose = () => {
    this.props.history.pushState(null, `/interface`);
  };

  _onEditToggle = () => {
    const editMode = !this.state.editMode;
    this.setState({ editMode });
  };

  _onEditSubmit = (detail, userCfg) => {
    this.props.actions.interface.set(detail, userCfg);
    this._onEditToggle();
  };

  _onCloseError = () => {
    this.props.actions.interface.clearErrorForSet();
  };

  _tr = (td1, td2, style) => {
    return (
      <tr style={style}>
        <td>{td1}:</td>
        <td>{td2}</td>
      </tr>
    );
  };

  render() {
    const id = this.props.params.id;
    const detail = this.props.interface.detail;
    const inf = detail.inf;
    const port = detail.port;
    const set = this.props.interface.set;

    const editLayer = !this.state.editMode ? null :
      <InterfaceEdit
          onClose={this._onEditToggle}
          onSubmit={this._onEditSubmit}
          detail={detail}
      />;

    const errorLayer = !set.lastError ? null :
      <ErrorLayer error={set.lastError} onClose={this._onCloseError} />;

    const ipV4 = (port.id && port.ipV4) || t('notConfigured');
    const ipV6 = (port.id && port.ipV6) || t('notConfigured');

    // TODO: format the numerical values using 1,000,000 etc.
    return (
      <Box pad="small" className="min200x400">
        <Header tag="h4" justify="between">
          <Title>{`${t('interface')}: ${id}`}</Title>
          <Menu direction="row" justify="end" responsive={false}>
            <Anchor onClick={set.inProgress ? null : this._onEditToggle}>
              {set.inProgress ? <RefreshIcon className="spin"/> : <EditIcon/>}
            </Anchor>
            <Anchor onClick={this._onClose}>
              <CloseIcon/>
            </Anchor>
          </Menu>
        </Header>
        <hr/>
        {editLayer}
        {errorLayer}
        <table style={{tableLayout: 'fixed'}} className="propTable">
          <tbody>
          {this._tr(t('userCfgAdmin'), t(inf.userCfgAdmin))}
          {this._tr(t('adminState'), t(inf.adminStateConnector))}
          {this._tr(t('linkState'), t(inf.linkState))}
          {this._tr(t('duplex'), t(inf.duplex))}
          {this._tr(t('speed'), inf.speedFormatted)}
          {this._tr(t('connector'), inf.connector)}
          {this._tr(t('mac'), inf.mac)}
          {this._tr(t('mtu'), inf.mtu)}
          {this._tr(t('autoNeg'), t(inf.userCfgAutoNeg))}
          {this._tr(t('flowControl'), t(inf.userCfgFlowCtrl))}
          {this._tr(t('ipV4'), ipV4)}
          {this._tr(t('ipV6'), ipV6)}
          {this._tr(t('rxPackets'), inf.rxPackets)}
          {this._tr(t('rxBytes'), inf.rxBytes)}
          {this._tr(t('rxErrors'), inf.rxErrors)}
          {this._tr(t('rxDropped'), inf.rxDropped)}
          {this._tr(t('txPackets'), inf.txPackets)}
          {this._tr(t('txBytes'), inf.txBytes)}
          {this._tr(t('txErrors'), inf.txErrors)}
          {this._tr(t('txDropped'), inf.txDropped)}
          </tbody>
        </table>
        <br/>
        <b>{t('lldpNeighborInfo')}</b>
        <hr/>
        <table style={{tableLayout: 'fixed'}} className="propTable">
          <tbody>
          {this._tr(t('chassisName'), inf.lldp.chassisName)}
          {this._tr(t('chassisId'), inf.lldp.chassisId)}
          {this._tr(t('ip'), inf.lldp.ip)}
          {this._tr(t('portId'), inf.lldp.portId)}
          {this._tr(t('sysDesc'), inf.lldp.sysDesc)}
          {this._tr(t('capsSupported'), inf.lldp.capsSupported)}
          {this._tr(t('capsEnabled'), inf.lldp.capsEnabled)}
          </tbody>
        </table>
        <br/>
        <b>{t('lldpPortStats')}</b>
        <hr/>
        <table style={{tableLayout: 'fixed'}} className="propTable">
          <tbody>
          {this._tr(t('framesRx'), inf.lldp.framesRx)}
          {this._tr(t('framesRxDiscarded'), inf.lldp.framesRxDiscarded)}
          {this._tr(t('framesRxUnrecog'), inf.lldp.framesRxUnrecog)}
          {this._tr(t('framesTx'), inf.lldp.framesTx)}
          </tbody>
        </table>
      </Box>
    );
  }
}

function select(store) {
  return {
    collector: store.collector,
    interface: store.interface,
  };
}

export default connect(select)(InterfaceDetails);
