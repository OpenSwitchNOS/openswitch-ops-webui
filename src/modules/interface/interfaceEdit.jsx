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
import ConfirmLayer from 'confirmLayer.jsx';


class InterfaceEdit extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    infId: PropTypes.string.isRequired,
    interface: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = { [C.USER_CFG]: {}};
  }

  componentDidMount() {
    const p = this.props;
    p.actions.interface.fetchEdit(this.props.infId);
  }

  componentWillReceiveProps(nextProps) {
    const async = this.props.interface.asyncStatus;
    const nextAsync = nextProps.interface.asyncStatus;
    if (nextAsync.lastSuccessMillis > async.lastSuccessMillis) {
      const edit = nextProps.interface.edit;
      this.setState({ [C.USER_CFG]: { ...edit.interface[C.USER_CFG] }});
    }
  }

  _isDirty = () => {
    const initUserCfg = this.props.interface.edit.interface[C.USER_CFG];
    return !_.isEqual(this.state[C.USER_CFG], initUserCfg);
  };

  _onOk = () => {
    const laneSplit = this.state[C.USER_CFG][C.LANE_SPLIT];
    if (laneSplit === 'split') {
      this.setState({splitConfirm: true});
    } else {
      this.props.actions.interface.edit(this.state);
      this.props.onClose();
    }
  };

  _onConfirm = () => {
    this.props.actions.interface.edit(this.state);
    this.props.onClose();
  };

 _onClose = () => {
   this.props.onClose();
 };

  _onChange = (setting) => {
    let newUserCfg = { ...this.state[C.USER_CFG], ...setting };
    if (setting[C.LANE_SPLIT] === 'split') {
      newUserCfg = {...this.props.interface.edit.interface[C.USER_CFG]};
      newUserCfg[C.LANE_SPLIT] = 'split';
    }
    this.setState({ [C.USER_CFG]: newUserCfg });
  };

  _onSplitOk = () => {
    const laneSplit = this.state[C.USER_CFG][C.LANE_SPLIT];
    if (laneSplit === '') {
      this.setState({unSplitConfirm: true});
    }
  };

  _onConfirmUnSplit = () => {
    this.props.actions.interface.unsplit();
    this.props.onClose();
  };

  _mkSplit = () => {
    const uc = this.state[C.USER_CFG];
    const laneSplit = uc && uc[C.LANE_SPLIT];

    return (
      <div>
        <b>{t('split')}</b>
        <FormField>
          <RadioButton
              id="split"
              label={t('split')}
              checked={laneSplit === 'split'}
              onChange={() => this._onChange({[C.LANE_SPLIT]: 'split'})} />
          <RadioButton
              id="unSplit"
              label={t('unSplit')}
              checked={laneSplit === ''}
              onChange={() => this._onChange({[C.LANE_SPLIT]: ''})} />
        </FormField>
      </div>
    );
  };

  _mkMainConfig = () => {
    const uc = this.state[C.USER_CFG];
    const admin = uc && uc[C.ADMIN];
    const duplex = uc && uc[C.DUPLEX];
    const autoNeg = uc && uc[C.AUTO_NEG];
    const flowCtrl = uc && uc[C.FLOW_CTRL];
    const laneSplit = uc && uc[C.LANE_SPLIT];
    const id = this.props.infId;
    const inf = this.props.interface.interfaces[id];
    const splitOptions = inf.canSplit;
    const splitConfirm = !(this.state.splitConfirm) ? null :
    <ConfirmLayer
        onClose={() => this.setState({splitConfirm: false})}
        onSubmit={this._onConfirm}
        submitLabel={t('yes')}>
        {t('areYouSureSplit')}
      </ConfirmLayer>;

    return (
      <div>
      {splitConfirm}
      <b>{t('configured')}</b>
      <FormField>
        <RadioButton
            id="adminUp"
            label={t('up')}
            checked={admin === 'up'}
            disabled={laneSplit==='split'}
            onChange={() => this._onChange({[C.ADMIN]: 'up'})} />
        <RadioButton
            id="adminDown"
            label={t('down')}
            checked={admin === 'down'}
            disabled={laneSplit==='split'}
            onChange={() => this._onChange({[C.ADMIN]: 'down'})} />
      </FormField>
      <br/>
      <b>{t('autoNeg')}</b>
      <FormField>
        <RadioButton
            id="autoNegOn"
            label={t('on')}
            checked={autoNeg === 'on'}
            disabled={laneSplit==='split'}
            onChange={() => this._onChange({[C.AUTO_NEG]: 'on'})} />
        <RadioButton
            id="autoNegOff"
            label={t('off')}
            disabled={laneSplit==='split'}
            checked={autoNeg === 'off'}
            onChange={() => this._onChange({[C.AUTO_NEG]: 'off'})} />
      </FormField>
      <br/>
      <b>{t('duplex')}</b>
      <FormField>
        <RadioButton
            id="duplexFull"
            label={t('full')}
            checked={duplex === 'full'}
            disabled={laneSplit==='split'}
            onChange={() => this._onChange({[C.DUPLEX]: 'full'})} />
        <RadioButton
            id="duplexHalf"
            label={t('half')}
            checked={duplex === 'half'}
            disabled={laneSplit==='split'}
            onChange={() => this._onChange({[C.DUPLEX]: 'half'})} />
      </FormField>
      <br/>
      <b>{t('flowControl')}</b>
      <FormField>
        <RadioButton
            id="fcNone"
            label={t('none')}
            checked={flowCtrl === 'none'}
            disabled={laneSplit==='split'}
            onChange={() => this._onChange({[C.FLOW_CTRL]: 'none'})} />
        <RadioButton
            id="fcRx"
            label={t('rx')}
            checked={flowCtrl === 'rx'}
            disabled={laneSplit==='split'}
            onChange={() => this._onChange({[C.FLOW_CTRL]: 'rx'})} />
        <RadioButton
            id="fxTx"
            label={t('tx')}
            checked={flowCtrl === 'tx'}
            disabled={laneSplit==='split'}
            onChange={() => this._onChange({[C.FLOW_CTRL]: 'tx'})} />
        <RadioButton
            id="fcRxTx"
            label={t('rxtx')}
            checked={flowCtrl === 'rxtx'}
            disabled={laneSplit==='split'}
            onChange={() => this._onChange({[C.FLOW_CTRL]: 'rxtx'})} />
      </FormField>
      <br/>
      {!splitOptions ? null : this._mkSplit()}
      <br/>
      <Footer pad={{vertical: 'medium'}}>
        <Menu>
          <Button
              label={t('ok')}
              primary
              onClick={this._isDirty() ? this._onOk : null}/>
        </Menu>
      </Footer>
      </div>
    );
  };

  _mkSplitConfig = () => {
    const unSplitConfirm = !(this.state.unSplitConfirm) ? null :
    <ConfirmLayer
        onClose={() => this.setState({unsplitConfirm: false})}
        onSubmit={this._onConfirmUnSplit}
        submitLabel={t('yes')}>
        {t('areYouSureUnSplit')}
      </ConfirmLayer>;

    return (
      <div>
      {unSplitConfirm}
        <hr/>
        <b>{t('UnSplitInfCfg')}</b>
        {this._mkSplit()}
        <br/>
        <Footer pad={{vertical: 'medium'}}>
          <Menu>
            <Button
                label={t('ok')}
                primary
                onClick={this.state[C.USER_CFG][C.LANE_SPLIT] === 'split' ?
                         null : this._onSplitOk}/>
          </Menu>
        </Footer>
      </div>
    );
  };


  render() {
    const id = this.props.infId;
    const inf = this.props.interface.interfaces[id];
    const laneSplit = inf.cfgLaneSplit;
    const cfg = (laneSplit === 'split') ?
      this._mkSplitConfig() : this._mkMainConfig();

    return (
      <div>
      <Layer
          className="edit"
          onClose={this.props.onClose}
          closer
          flush
          align="right">
        <Box pad="medium" className="flex1">
          <Title>{`${t('edit')} ${t('interface')}: ${this.props.infId}`}</Title>
          <br/>
          {cfg}
        </Box>
      </Layer>
      </div>
    );
  }
}

function select(store) {
  return {
    interface: store.interface,
  };
}

export default connect(select)(InterfaceEdit);
