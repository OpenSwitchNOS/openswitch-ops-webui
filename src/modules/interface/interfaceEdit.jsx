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


class InterfaceEdit extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    infId: PropTypes.string.isRequired,
    interface: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.fid = _.uniqueId('infEdit_');
    this.state = { userCfg: {} };
  }

  _id = s => `${this.fid}_${s}`;

  componentDidMount() {
    const p = this.props;
    p.actions.interface.fetchEdit(this.props.infId);
  }

  componentWillReceiveProps(nextProps) {
    const p = nextProps;
    this.setState({ userCfg: { ...p.interface.interface.userCfg }});
  }

  _isDirty = () => {
    const initUserCfg = this.props.interface.interface.userCfg;
    return !_.isEqual(this.state.userCfg, initUserCfg);
  };

  _onOk = () => {
    this.props.actions.interface.edit(this.props.infId, this.state.userCfg);
    this.props.onClose();
  };

  _onChange = (setting) => {
    const userCfg = { ...this.state.userCfg, ...setting };
    this.setState({ userCfg });
  };

  render() {
    const userCfg = this.state.userCfg;
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
                checked={userCfg.admin === 'up'}
                onChange={() => this._onChange({admin: 'up'})} />
            <RadioButton
                id={this._id('adminDown')}
                label={t('down')}
                checked={userCfg.admin !== 'up'}
                onChange={() => this._onChange({admin: 'down'})} />
          </FormField>
          <br/>
          <b>{t('autoNeg')}</b>
          <FormField>
            <RadioButton
                id={this._id('autoNegOn')}
                label={t('on')}
                checked={userCfg.autoNeg === 'on'}
                onChange={() => this._onChange({autoNeg: 'on'})} />
            <RadioButton
                id={this._id('autoNegOff')}
                label={t('off')}
                checked={userCfg.autoNeg !== 'on'}
                onChange={() => this._onChange({autoNeg: 'off'})} />
          </FormField>
          <br/>
          <b>{t('duplex')}</b>
          <FormField>
            <RadioButton
                id={this._id('duplexFull')}
                label={t('full')}
                checked={userCfg.duplex !== 'half'}
                onChange={() => this._onChange({duplex: 'full'})} />
            <RadioButton
                id={this._id('duplexHalf')}
                label={t('half')}
                checked={userCfg.duplex === 'half'}
                onChange={() => this._onChange({duplex: 'half'})} />
          </FormField>
          <br/>
          <b>{t('flowControl')}</b>
          <FormField>
            <RadioButton
                id={this._id('fcNone')}
                label={t('none')}
                checked={userCfg.flowCtrl === 'none'}
                onChange={() => this._onChange({flowCtrl: 'none'})} />
            <RadioButton
                id={this._id('fcTx')}
                label={t('rx')}
                checked={userCfg.flowCtrl === 'rx'}
                onChange={() => this._onChange({flowCtrl: 'rx'})} />
            <RadioButton
                id={this._id('fcRx')}
                label={t('tx')}
                checked={userCfg.flowCtrl === 'tx'}
                onChange={() => this._onChange({flowCtrl: 'tx'})} />
            <RadioButton
                id={this._id('fcRxTx')}
                label={t('rxtx')}
                checked={userCfg.flowCtrl === 'rxtx'}
                onChange={() => this._onChange({flowCtrl: 'rxtx'})} />
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
