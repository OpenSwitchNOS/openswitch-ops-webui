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
import Layer from 'grommet/components/Layer';
import Header from 'grommet/components/Header';
import Footer from 'grommet/components/Footer';
import Menu from 'grommet/components/Menu';
import Form from 'grommet/components/Form';
import Button from 'grommet/components/Button';
import Title from 'grommet/components/Title';
import { t } from 'i18n/lookup.js';
import Box from 'grommet/components/Box';
import CheckBox from 'grommet/components/CheckBox';

class EcmpEdit extends Component {

  static propTypes = {
    ecmp: PropTypes.object.isRequired,
    history: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    const data = this.props.ecmp;
    this.state = {
      ecmpDataObj: {
        enabled: data.enabled,
        resilientHash: data.resilientHash,
        hashSrcIp: data.hashSrcIp,
        hashSrcPort: data.hashSrcPort,
        hashDstIp: data.hashDstIp,
        hashDstPort: data.hashDstPort,
      },
    };
  }

  isDirty = () => {
    const data = this.props.ecmp;
    return this.state.ecmpDataObj.enabled !== data.enabled ||
      this.state.ecmpDataObj.resilientHash !== data.resilientHash ||
      this.state.ecmpDataObj.hashSrcIp !== data.hashSrcIp ||
      this.state.ecmpDataObj.hashSrcPort !== data.hashSrcPort ||
      this.state.ecmpDataObj.hashDstIp !== data.hashDstIp ||
      this.state.ecmpDataObj.hashDstPort !== data.hashDstPort;
  };

  _onChange = (e) => {
    const fieldName = e.target.getAttribute('id');
    const ecmpDataObj = {
      ...this.state.ecmpDataObj,
      [fieldName]: e.target.checked ? 'enabled' : 'disabled' };
    this.setState({ ecmpDataObj});
  };

  _onSubmit = () => {
    const ecmpDataObj = this.state.ecmpDataObj;
    this.props.onSubmit(ecmpDataObj);
  };

  render() {
    const ecmpDataObj = this.state.ecmpDataObj;
    return (
      <Layer
          onClose={this.props.onClose}
          closer
          flush
          align="right"
          >
        <Box pad="small" className="details min75x125">
        <Form pad="small" className="mLeft" onSubmit={this._onSubmit}>
        <Header>
          <Title>Edit ECMP</Title>
        </Header>
        <hr/>
        <br/>
        <CheckBox id="resilientHash"
            label={t('resilientHash')}
            toggle
            reverse
            checked={ecmpDataObj.resilientHash === 'enabled'}
            onChange={this._onChange} />
        <br/>
        <br/>
        <br/>
        <b>{t('ecmp')} {t('loadBalance')}</b>
        <hr/>
        <CheckBox id="hashSrcIp"
            label={t('srcIp')}
            toggle
            reverse
            checked={ecmpDataObj.hashSrcIp === 'enabled'}
            onChange={this._onChange} />
        <br/>
        <br/>
        <CheckBox id="hashSrcPort"
            label={t('srcPort')}
            toggle
            reverse
            checked={ecmpDataObj.hashSrcPort === 'enabled'}
            onChange={this._onChange} />
        <br/>
        <br/>
        <CheckBox id="hashDstIp"
            label={t('dstIp')}
            toggle
            reverse
            checked={ecmpDataObj.hashDstIp === 'enabled'}
            onChange={this._onChange} />
        <br/>
        <br/>
        <CheckBox id="hashDstPort"
            label={t('dstPort')}
            toggle
            reverse
            checked={ecmpDataObj.hashDstPort === 'enabled'}
            onChange={this._onChange} />
        <br/>
        <br/>

      <Footer pad={{vertical: 'medium'}}>
        <Menu>
          <Button label={t('deploy')} primary
              onClick={this.isDirty() ? this._onSubmit : null} />
        </Menu>
      </Footer>
      </Form>
      </Box>
    </Layer>
  );
  }
}

function select(store) {
  return {
    ecmp: store.ecmp,
  };
}

export default connect(select)(EcmpEdit);
