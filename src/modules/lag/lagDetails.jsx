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
import Title from 'grommet/components/Title';
import Anchor from 'grommet/components/Anchor';
import Box from 'grommet/components/Box';
import CloseIcon from 'grommet/components/icons/base/Close';
import Formatter from 'formatter.js';
import naturalSort from 'sorts.js';
import { pr } from 'propRow.jsx';


class LagDetails extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    lag: PropTypes.object.isRequired,
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  _onClose = () => {
    this.props.history.pushState(null, `/lag`);
  };

  render() {
    const id = this.props.params.id;
    const lag = this.props.lag.lags[id];
    const tcs = Formatter.toCommaString;
    const infs = Object.keys(lag.interfaces).sort(naturalSort).join(', ');

    return (
      <Box pad="small">
        <Box direction="row" justify="between">
          <Title>{`${t('lag')}: ${this.props.params.id}`}</Title>
          <Anchor onClick={this._onClose}>
            <CloseIcon/>
          </Anchor>
        </Box>
        <br/>
        <table style={{tableLayout: 'fixed'}} className="propTable">
          <tbody>
            {pr('name', lag.name, 160, 180)}
            {pr('id', lag.id)}
            {pr('mode', t(lag.lacp))}
            {pr('interfaces', infs)}
            {pr('speed', lag.speed)}
            {pr('bondStatus', t(lag.bondStatus))}
            {pr('rxPackets', tcs(lag.stats.rxPackets))}
            {pr('rxBytes', tcs(lag.stats.rxBytes))}
            {pr('rxErrors', tcs(lag.stats.rxErrors))}
            {pr('rxDropped', tcs(lag.stats.rxDropped))}
            {pr('txPackets', tcs(lag.stats.txPackets))}
            {pr('txBytes', tcs(lag.stats.txBytes))}
            {pr('txErrors', tcs(lag.stats.txErrors))}
            {pr('txDropped', tcs(lag.stats.txDropped))}
          </tbody>
        </table>
      </Box>
    );
  }
}

function select(store) {
  return {
    lag: store.lag,
  };
}

export default connect(select)(LagDetails);
