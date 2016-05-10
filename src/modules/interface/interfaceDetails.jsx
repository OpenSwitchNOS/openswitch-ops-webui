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
import { t, tOrKey } from 'i18n/lookup.js';
import Title from 'grommet/components/Title';
import Anchor from 'grommet/components/Anchor';
import Box from 'grommet/components/Box';
import Tab from 'grommet/components/Tab';
import Tabs from 'grommet/components/Tabs';
import CloseIcon from 'grommet/components/icons/base/Close';
import Formatter from 'formatter.js';
import { pr } from 'propRow.jsx';

const LLDP_SYS_DESC_SEARCH = 'OpenSwitch';


class InterfaceDetails extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    interface: PropTypes.object.isRequired,
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const p = this.props;
    p.actions.interface.fetchDetail(this.props.params.id);
  }

  _onRefresh = () => {
    this.props.actions.interface.fetchDetail(this.props.params.id);
  };

  componentWillReceiveProps(nextProps) {
    const p = nextProps;
    if (this.props.params.id !== p.params.id) {
      this.props.actions.interface.fetchDetail(p.params.id);
    }
    p.actions.toolbar.setFetchTB(p.interface.asyncStatus, this._onRefresh);
  }

  _onClose = () => {
    this.props.history.pushState(null, `/interface`);
  };

  render() {
    const inf = this.props.interface.interface;
    const port = this.props.interface.port;
    const tcs = Formatter.toCommaString;
    const parent = inf.splitParent;
    let splitChildren = '';
    if (inf.splitChildren) {
      splitChildren = inf.splitChildren.sort().join(', ');
    }

    const sysDesc = inf.lldp.sysDesc;
    const lldpOpsLink = sysDesc && sysDesc.indexOf(LLDP_SYS_DESC_SEARCH) >= 0 ?
      (
        <a href={`http://${inf.lldp.ip}`} target="_blank">
          &nbsp;&nbsp;<u>{inf.lldp.ip}</u>
        </a>
      ) : null;

    return (
      <Box pad="small">
        <Box direction="row" justify="between">
          <Title>{`${t('interface')}: ${this.props.params.id}`}</Title>
          <Anchor onClick={this._onClose}>
            <CloseIcon/>
          </Anchor>
        </Box>
        <Tabs>
          <Tab title={t('general')}>
            <table style={{tableLayout: 'fixed', width: 380}} className="propTable">
              <tbody>
                {pr('configured', t(inf.cfgAdmin), 180, 200)}
                {pr('adminState', t(inf.adminStateConnector))}
                {pr('linkState', t(inf.linkState))}
                {pr('duplex', t(inf.duplex))}
                {pr('speed', inf.speedFormatted)}
                {pr('connector', tOrKey(inf.connector))}
                {pr('mac', inf.mac)}
                {pr('mtu', inf.mtu)}
                {pr('autoNeg', t(inf.cfgAutoNeg))}
                {pr('flowControl', t(inf.cfgFlowCtrl))}
                {pr('ipV4', port.ipV4)}
                {pr('ipV6', port.ipV6)}
                {pr('splitParent', parent)}
                {pr('splitChildren', splitChildren)}
              </tbody>
            </table>
          </Tab>
          <Tab title={t('statistics')}>
            <table style={{tableLayout: 'fixed', width: 380}} className="propTable">
              <tbody>
                {pr('rxPackets', tcs(inf.rxPackets), 180, 200)}
                {pr('rxBytes', tcs(inf.rxBytes))}
                {pr('rxErrors', tcs(inf.rxErrors))}
                {pr('rxDropped', tcs(inf.rxDropped))}
                {pr('txPackets', tcs(inf.txPackets))}
                {pr('txBytes', tcs(inf.txBytes))}
                {pr('txErrors', tcs(inf.txErrors))}
                {pr('txDropped', tcs(inf.txDropped))}
              </tbody>
            </table>
          </Tab>
          <Tab title={t('lldp')}>
            <small>{t('neighborInfo')}{lldpOpsLink}</small>
            <hr/>
            <table style={{tableLayout: 'fixed', width: 380}} className="propTable">
              <tbody>
                {pr('chassisName', inf.lldp.chassisName, 180, 200)}
                {pr('chassisId', inf.lldp.chassisId)}
                {pr('ip', inf.lldp.ip)}
                {pr('portId', inf.lldp.portId)}
                {pr('sysDesc', inf.lldp.sysDesc, 180, 200)}
                {pr('capsSupported', inf.lldp.capsSupported)}
                {pr('capsEnabled', inf.lldp.capsEnabled)}
              </tbody>
            </table>
            <br/>
            <small>{t('statistics')}</small>
            <hr/>
            <table style={{tableLayout: 'fixed', width: 380}} className="propTable">
              <tbody>
                {pr('framesRx', tcs(inf.lldp.framesRx), 180, 200)}
                {pr('framesRxDiscarded', tcs(inf.lldp.framesRxDiscarded))}
                {pr('framesRxUnrecog', tcs(inf.lldp.framesRxUnrecog))}
                {pr('framesTx', tcs(inf.lldp.framesTx))}
              </tbody>
            </table>
          </Tab>
          <Tab title={t('lag')}>
            <table style={{tableLayout: 'fixed', width: 380}} className="propTable">
              <tbody>
                {pr('lagActorKey', inf.lag.actorKey)}
                {pr('lagActorSystemId', inf.lag.actorSystemId)}
                {pr('lagActorPortId', inf.lag.actorPortId)}
                {pr('lagActorState', inf.lag.actorState)}
                {pr('lagPartnerKey', inf.lag.partnerKey)}
                {pr('lagPartnerSystemId', inf.lag.partnerSystemId)}
                {pr('lagPartnerPortId', inf.lag.partnerPortId)}
                {pr('lagPartnerState', inf.lag.partnerState)}
              </tbody>
            </table>
          </Tab>
        </Tabs>
      </Box>
    );
  }
}

function select(store) {
  return {
    interface: store.interface,
  };
}

export default connect(select)(InterfaceDetails);
