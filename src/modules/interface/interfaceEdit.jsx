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
import { t } from 'i18n/lookup.js';
import Header from 'grommet/components/Header';
import Footer from 'grommet/components/Footer';
import Menu from 'grommet/components/Menu';
import Title from 'grommet/components/Title';
import Box from 'grommet/components/Box';
import Layer from 'grommet/components/Layer';
import Form from 'grommet/components/Form';
import FormField from 'grommet/components/FormField';
import FormFields from 'grommet/components/FormFields';
import RadioButton from 'grommet/components/RadioButton';
import Button from 'grommet/components/Button';
import _ from 'lodash';


class InterfaceEdit extends Component {

  static propTypes = {
    detail: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.pad = {horizontal: 'small', vertical: 'small'};
    this.fid = _.uniqueId('infEdit_');
    const userCfg = { ...this.props.detail.inf.userCfg };
    this.state = { userCfg };
  }

  _isDirty = () => {
    return !_.isEqual(this.state.userCfg, this.props.detail.inf.userCfg);
  };

  _onSubmit = () => {
    this.props.onSubmit(this.props.detail, this.state.userCfg);
  };

  _id = s => `${this.fid}_${s}`;

  _onChangeAdminUp = () => {
    const userCfg = { ...this.state.userCfg, admin: 'up' };
    this.setState({ userCfg });
  };

  _onChangeAdminDown = () => {
    const userCfg = { ...this.state.userCfg, admin: 'down' };
    this.setState({ userCfg });
  };

  _onChangeAutoNegOn = () => {
    const userCfg = { ...this.state.userCfg, autoNeg: 'on' };
    this.setState({ userCfg });
  };

  _onChangeAutoNegOff = () => {
    const userCfg = { ...this.state.userCfg, autoNeg: 'off' };
    this.setState({ userCfg });
  };

  _onChangeDuplexFull = () => {
    const userCfg = { ...this.state.userCfg, duplex: 'full' };
    this.setState({ userCfg });
  };

  _onChangeDuplexHalf = () => {
    const userCfg = { ...this.state.userCfg, duplex: 'half' };
    this.setState({ userCfg });
  };

  _onChangeFcNone = () => {
    const userCfg = { ...this.state.userCfg, flowCtrl: 'none' };
    this.setState({ userCfg });
  };

  _onChangeFcTx = () => {
    const userCfg = { ...this.state.userCfg, flowCtrl: 'tx' };
    this.setState({ userCfg });
  };

  _onChangeFcRx = () => {
    const userCfg = { ...this.state.userCfg, flowCtrl: 'rx' };
    this.setState({ userCfg });
  };

  _onChangeFcRxTx = () => {
    const userCfg = { ...this.state.userCfg, flowCtrl: 'rxtx' };
    this.setState({ userCfg });
  };

  render() {
    return (
      <Layer
          className="edit"
          onClose={this.props.onClose}
          closer
          flush
          align="right">
        <Box pad="small" className="flex1">
          <Header tag="h4" justify="between" pad={{horizontal: 'medium'}}>
            <Title>
            {`${t('edit')} ${t('interface')}: ${this.props.detail.inf.id}`}
            </Title>
          </Header>
          <hr/>
          <Form>
            <FormFields>
              <fieldset>
                <legend>{t('userCfgAdmin')}</legend>
                <FormField>
                  <RadioButton
                      id={this._id('userCfgAdminUp')}
                      label={t('up')}
                      checked={this.state.userCfg.admin === 'up'}
                      onChange={this._onChangeAdminUp} />
                  <RadioButton
                      id={this._id('userCfgAdminDown')}
                      label={t('down')}
                      checked={this.state.userCfg.admin !== 'up'}
                      onChange={this._onChangeAdminDown} />
                </FormField>
                <legend>{t('autoNeg')}</legend>
                <FormField>
                  <RadioButton
                      id={this._id('userCfgAutoNegOn')}
                      label={t('on')}
                      checked={this.state.userCfg.autoNeg === 'on'}
                      onChange={this._onChangeAutoNegOn} />
                  <RadioButton
                      id={this._id('userCfgAutoNegOff')}
                      label={t('off')}
                      checked={this.state.userCfg.autoNeg !== 'on'}
                      onChange={this._onChangeAutoNegOff} />
                </FormField>
                <legend>{t('duplex')}</legend>
                <FormField>
                  <RadioButton
                      id={this._id('userCfgDuplexFull')}
                      label={t('full')}
                      checked={this.state.userCfg.duplex !== 'half'}
                      onChange={this._onChangeDuplexFull} />
                  <RadioButton
                      id={this._id('userCfgDuplexHalf')}
                      label={t('half')}
                      checked={this.state.userCfg.duplex === 'half'}
                      onChange={this._onChangeDuplexHalf} />
                </FormField>
                <legend>{t('flowControl')}</legend>
                <FormField>
                  <RadioButton
                      id={this._id('userCfgFcNone')}
                      label={t('none')}
                      checked={this.state.userCfg.flowCtrl === 'none'}
                      onChange={this._onChangeFcNone} />
                  <RadioButton
                      id={this._id('userCfgFcTx')}
                      label={t('rx')}
                      checked={this.state.userCfg.flowCtrl === 'tx'}
                      onChange={this._onChangeFcTx} />
                  <RadioButton
                      id={this._id('userCfgFcRx')}
                      label={t('tx')}
                      checked={this.state.userCfg.flowCtrl === 'rx'}
                      onChange={this._onChangeFcRx} />
                  <RadioButton
                      id={this._id('userCfgFcTxRx')}
                      label={t('rxtx')}
                      checked={this.state.userCfg.flowCtrl === 'rxtx'}
                      onChange={this._onChangeFcRxTx} />
                </FormField>
              </fieldset>
            </FormFields>
            <Footer pad={{vertical: 'medium'}}>
              <Menu>
                <Button
                    label={t('deploy')}
                    primary
                    onClick={this._isDirty() ? this._onSubmit : null}/>
              </Menu>
            </Footer>
          </Form>
        </Box>
      </Layer>
    );
  }
}

export default InterfaceEdit;
