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

  _onClose = () => {
    this.props.history.pushState(null, `/interface`);
  };

  render() {
    const inf = this.props.interface.interface;
    const port = this.props.interface.port;
    const tcs = Formatter.toCommaString;

    const sysDesc = inf.lldp.sysDesc;
    const lldpOpsLink = sysDesc && sysDesc.indexOf(LLDP_SYS_DESC_SEARCH) < 0 ?
      (
        <a href={`http://${inf.lldp.ip}`} target="_blank">
          &nbsp;&nbsp;<u>{inf.lldp.ip}</u>
        </a>
      ) : null;

    function tr(key, data, wKey, wData) {
      return (
        <tr>
          {wKey ? <td style={{width: wKey}}>{t(key)}:</td> : <td>{t(key)}:</td>}
          {wData ? <td style={{width: wData}}>{data}</td> : <td>{data}</td>}
        </tr>
      );
    }

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
            <table style={{tableLayout: 'fixed'}} className="propTable">
              <tbody>
                {tr('configured', t(inf.cfgAdmin), 180, 200)}
                {tr('adminState', t(inf.adminStateConnector))}
                {tr('linkState', t(inf.linkState))}
                {tr('duplex', t(inf.duplex))}
                {tr('speed', inf.speedFormatted)}
                {tr('connector', tOrKey(inf.connector))}
                {tr('mac', inf.mac)}
                {tr('mtu', inf.mtu)}
                {tr('autoNeg', t(inf.cfgAutoNeg))}
                {tr('flowControl', t(inf.cfgFlowCtrl))}
                {tr('ipV4', port.ipV4)}
                {tr('ipV6', port.ipV6)}
              </tbody>
            </table>
          </Tab>
          <Tab title={t('statistics')}>
            <table style={{tableLayout: 'fixed'}} className="propTable">
              <tbody>
                {tr('rxPackets', tcs(inf.rxPackets), 180, 200)}
                {tr('rxBytes', tcs(inf.rxBytes))}
                {tr('rxErrors', tcs(inf.rxErrors))}
                {tr('rxDropped', tcs(inf.rxDropped))}
                {tr('txPackets', tcs(inf.txPackets))}
                {tr('txBytes', tcs(inf.txBytes))}
                {tr('txErrors', tcs(inf.txErrors))}
                {tr('txDropped', tcs(inf.txDropped))}
              </tbody>
            </table>
          </Tab>
          <Tab title={t('lldp')}>
            <small>{t('neighborInfo')}{lldpOpsLink}</small>
            <hr/>
            <table style={{tableLayout: 'fixed'}} className="propTable">
              <tbody>
                {tr('chassisName', inf.lldp.chassisName, 180, 200)}
                {tr('chassisId', inf.lldp.chassisId)}
                {tr('ip', inf.lldp.ip)}
                {tr('portId', inf.lldp.portId)}
                {tr('sysDesc', inf.lldp.sysDesc)}
                {tr('capsSupported', inf.lldp.capsSupported)}
                {tr('capsEnabled', inf.lldp.capsEnabled)}
              </tbody>
            </table>
            <br/>
            <small>{t('statistics')}</small>
            <hr/>
            <table style={{tableLayout: 'fixed'}} className="propTable">
              <tbody>
                {tr('framesRx', tcs(inf.lldp.framesRx), 180, 200)}
                {tr('framesRxDiscarded', tcs(inf.lldp.framesRxDiscarded))}
                {tr('framesRxUnrecog', tcs(inf.lldp.framesRxUnrecog))}
                {tr('framesTx', tcs(inf.lldp.framesTx))}
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
