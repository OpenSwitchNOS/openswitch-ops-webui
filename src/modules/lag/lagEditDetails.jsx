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
import FormField from 'grommet/components/FormField';
import Footer from 'grommet/components/Footer';
import Menu from 'grommet/components/Menu';
import Anchor from 'grommet/components/Anchor';
import Button from 'grommet/components/Button';
import Title from 'grommet/components/Title';
import RadioButton from 'grommet/components/RadioButton';
import { t } from 'i18n/lookup.js';
import Box from 'grommet/components/Box';
import * as C from './lagConst.js';
import _ from 'lodash';


class LagEditDetails extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    lag: PropTypes.object.isRequired,
    lagId: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    const lag = this.props.lag.lags[this.props.lagId];
    this.initialState = {
      [C.AGGR_MODE]: lag[C.AGGR_MODE],
      [C.OTHER_CFG]: {
        [C.RATE]: lag[C.RATE],
        [C.FALLBACK]: lag[C.FALLBACK],
        [C.HASH]: lag[C.HASH],
      }
    };
    this.state = {...this.initialState};
  }

  _isDirty = () => {
    return !_.isEqual(this.state, this.initialState);
  };

  _onChangeMode = (setting) => {
    this.setState({ [C.AGGR_MODE]: setting });
  };

  _onChange = (setting) => {
    const newOtherCfg = { ...this.state[C.OTHER_CFG], ...setting };
    this.setState({ [C.OTHER_CFG]: newOtherCfg });
  };

  _onOk = () => {
    let patchAggrMode = false;
    let patchOC = false;
    if (!(this.state[C.AGGR_MODE] === this.initialState[C.AGGR_MODE])) {
      patchAggrMode = true;
    }
    if (!(this.state[C.OTHER_CFG] === this.initialState[C.OTHER_CFG])) {
      patchOC = true;
    }
    this.props.actions.lag.editLagDetails(this.props.lagId,
        this.state, patchAggrMode, patchOC);
    this.props.onClose();
  };

  render() {
    return (
      <Layer
          className="edit"
          onClose={this.props.onClose}
          closer
          flush
          align="right">
        <Box pad="medium" className="flex1">
          <Title>{`${t('editLag')}: ${this.props.lagId}`}</Title>
          <br/>
          <b>{t('aggrMode')}</b>
          <div>
            <Menu label={t(this.state[C.AGGR_MODE])}>
              <Anchor onClick={() => this._onChangeMode(C.AGGR_MODE_ACTIVE)}>
                {t(C.AGGR_MODE_ACTIVE)}
              </Anchor>
              <Anchor onClick={() => this._onChangeMode(C.AGGR_MODE_PASSIVE)}>
                {t(C.AGGR_MODE_PASSIVE)}
              </Anchor>
              <Anchor onClick={() => this._onChangeMode(C.AGGR_MODE_OFF)}>
                {t(C.AGGR_MODE_OFF)}
              </Anchor>
            </Menu>
          </div>
          <br/>
          <b>{t('rate')}</b>
          <FormField>
            <RadioButton
                id="rateSlow"
                label={t('slow')}
                checked={this.state[C.OTHER_CFG][C.RATE] === 'slow'}
                onChange={() => this._onChange({[C.RATE]: C.RATE_SLOW})} />
            <RadioButton
                id="rateFast"
                label={t('fast')}
                checked={this.state[C.OTHER_CFG][C.RATE] === 'fast'}
                onChange={() => this._onChange({[C.RATE]: C.RATE_FAST})} />
          </FormField>
          <br/>
          <b>{t('fallback')}</b>
          <FormField>
            <RadioButton
                id="fallbackFalse"
                label={t('false')}
                checked={this.state[C.OTHER_CFG][C.FALLBACK] === 'false'}
                onChange={() => this._onChange({[C.FALLBACK]: 'false'})} />
            <RadioButton
                id="fallbackTrue"
                label={t('true')}
                checked={this.state[C.OTHER_CFG][C.FALLBACK] === 'true'}
                onChange={() => this._onChange({[C.FALLBACK]: 'true'})} />
          </FormField>
          <br/>
          <b>{t('hash')}</b>
          <div>
            <Menu label={t(this.state[C.OTHER_CFG][C.HASH])}>
              <Anchor onClick={() => this._onChange({[C.HASH]: C.HASH_L3})}>
                {t(C.HASH_L3)}
              </Anchor>
              <Anchor onClick={() => this._onChange({[C.HASH]: C.HASH_L2})}>
                {t(C.HASH_L2)}
              </Anchor>
              <Anchor onClick={() => this._onChange({[C.HASH]: C.HASH_L2_VID})}>
                {t(C.HASH_L2_VID)}
              </Anchor>
              <Anchor onClick={() => this._onChange({[C.HASH]: C.HASH_L4})}>
                {t(C.HASH_L4)}
              </Anchor>
            </Menu>
          </div>
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

const select = (store) => ({
  constants: store.constants,
  lag: store.lag
});

export default connect(select)(LagEditDetails);
