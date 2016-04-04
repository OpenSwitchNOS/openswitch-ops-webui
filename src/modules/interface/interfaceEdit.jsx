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
import Footer from 'grommet/components/Footer';
import Menu from 'grommet/components/Menu';
import Title from 'grommet/components/Title';
import Box from 'grommet/components/Box';
import Layer from 'grommet/components/Layer';
import FormField from 'grommet/components/FormField';
import RadioButton from 'grommet/components/RadioButton';
import Button from 'grommet/components/Button';
import _ from 'lodash';
import * as C from './interfaceConst.js';


class InterfaceEdit extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    infId: PropTypes.string.isRequired,
    interface: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    // TODO: do we really need to create IDs with lodash here?
    this.fid = _.uniqueId('infEdit_');
    this.state = { [C.USER_CFG]: {} };
  }

  _id = s => `${this.fid}_${s}`;

  componentDidMount() {
    const p = this.props;
    p.actions.interface.fetchEdit(this.props.infId);
  }

  componentWillReceiveProps(nextProps) {
    const edit = nextProps.interface.edit;
    this.setState({ [C.USER_CFG]: { ...edit.interface[C.USER_CFG] }});
  }

  _isDirty = () => {
    const initUserCfg = this.props.interface.edit.interface[C.USER_CFG];
    return !_.isEqual(this.state[C.USER_CFG], initUserCfg);
  };

  _onOk = () => {
    this.props.actions.interface.edit(this.state);
    this.props.onClose();
  };

  _onChange = (setting) => {
    const newUserCfg = { ...this.state[C.USER_CFG], ...setting };
    this.setState({ [C.USER_CFG]: newUserCfg });
  };

  render() {
    const uc = this.state[C.USER_CFG];
    const admin = uc && uc[C.ADMIN];
    const duplex = uc && uc[C.DUPLEX];
    const autoNeg = uc && uc[C.AUTO_NEG];
    const flowCtrl = uc && uc[C.FLOW_CTRL];

    return (
      <Layer
          className="edit"
          onClose={this.props.onClose}
          closer
          flush
          align="right">
        <Box pad="medium" className="flex1">
          <Title>{`${t('edit')} ${t('interface')}: ${this.props.infId}`}</Title>
          <br/>
          <b>{t('configured')}</b>
          <FormField>
            <RadioButton
                id={this._id('adminUp')}
                label={t('up')}
                checked={admin === 'up'}
                onChange={() => this._onChange({[C.ADMIN]: 'up'})} />
            <RadioButton
                id={this._id('adminDown')}
                label={t('down')}
                checked={admin === 'down'}
                onChange={() => this._onChange({[C.ADMIN]: 'down'})} />
          </FormField>
          <br/>
          <b>{t('autoNeg')}</b>
          <FormField>
            <RadioButton
                id={this._id('autoNegOn')}
                label={t('on')}
                checked={autoNeg === 'on'}
                onChange={() => this._onChange({[C.AUTO_NEG]: 'on'})} />
            <RadioButton
                id={this._id('autoNegOff')}
                label={t('off')}
                checked={autoNeg === 'off'}
                onChange={() => this._onChange({[C.AUTO_NEG]: 'off'})} />
          </FormField>
          <br/>
          <b>{t('duplex')}</b>
          <FormField>
            <RadioButton
                id={this._id('duplexFull')}
                label={t('full')}
                checked={duplex === 'full'}
                onChange={() => this._onChange({[C.DUPLEX]: 'full'})} />
            <RadioButton
                id={this._id('duplexHalf')}
                label={t('half')}
                checked={duplex === 'half'}
                onChange={() => this._onChange({[C.DUPLEX]: 'half'})} />
          </FormField>
          <br/>
          <b>{t('flowControl')}</b>
          <FormField>
            <RadioButton
                id={this._id('fcNone')}
                label={t('none')}
                checked={flowCtrl === 'none'}
                onChange={() => this._onChange({[C.FLOW_CTRL]: 'none'})} />
            <RadioButton
                id={this._id('fcTx')}
                label={t('rx')}
                checked={flowCtrl === 'rx'}
                onChange={() => this._onChange({[C.FLOW_CTRL]: 'rx'})} />
            <RadioButton
                id={this._id('fcRx')}
                label={t('tx')}
                checked={flowCtrl === 'tx'}
                onChange={() => this._onChange({[C.FLOW_CTRL]: 'tx'})} />
            <RadioButton
                id={this._id('fcRxTx')}
                label={t('rxtx')}
                checked={flowCtrl === 'rxtx'}
                onChange={() => this._onChange({[C.FLOW_CTRL]: 'rxtx'})} />
          </FormField>
          <Footer pad={{vertical: 'medium'}}>
            <Menu>
              <Button
                  label={t('ok')}
                  primary
                  onClick={this._isDirty() ? this._onOk : null}/>
            </Menu>
          </Footer>
        </Box>
      </Layer>
    );
  }
}

function select(store) {
  return {
    interface: store.interface,
  };
}

export default connect(select)(InterfaceEdit);
