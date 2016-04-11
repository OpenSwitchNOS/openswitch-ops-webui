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
import NumberInput from 'grommet/components/NumberInput';
import Menu from 'grommet/components/Menu';
import Anchor from 'grommet/components/Anchor';
import Button from 'grommet/components/Button';
import Title from 'grommet/components/Title';
import RadioButton from 'grommet/components/RadioButton';
import { t } from 'i18n/lookup.js';
import Range from 'range.js';
import OneToMany from 'oneToMany.jsx';
import Box from 'grommet/components/Box';
import Tabs from 'grommet/components/Tabs';
import Tab from 'grommet/components/Tab';
import * as C from './lagConst.js';


class LagAdd extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    lag: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    settings: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.cols = [{
      columnKey: 'id',
      header: t('interfaceId'),
      width: 180,
    }];

    this.availInfsInit = { ...props.lag.availInterfaces };

    const availLagIdRange = this._calcAvailLagIdRange(props);
    this.state = {
      availLagIdRange,
      lagId: availLagIdRange.firstItem(),
      [C.AGGR_MODE]: C.AGGR_MODE_DEF,
      [C.OTHER_CFG]: {
        [C.RATE]: C.RATE_DEF,
        [C.FALLBACK]: C.FALLBACK_DEF,
        [C.HASH]: C.HASH_DEF,
      },
      availInfs: { ...this.availInfsInit },
      lagInfs: {},
      diff: { addedCount: 0, added: {}, removedCount: 0, removed: {}, },
    };
  }

  _onChangeLag = (lagInfs, availInfs, diff) => {
    this.setState({ lagInfs, availInfs, diff });
  };

  _calcAvailLagIdRange = (props) => {
    const range = new Range(props.settings.LAG_ID_RANGE);
    const used = Object.keys(props.lag.lags).map( k => Number(k) );
    range.subtract(used);
    return range;
  };

  _onChangeNewLagId = (evt) => {
    this.setState({ lagId: Number(evt.target.value) });
  };

  _onChangeMode = (setting) => {
    this.setState({ [C.AGGR_MODE]: setting });
  };

  _onChangeOtherConfig = (setting) => {
    const newOtherCfg = { ...this.state[C.OTHER_CFG], ...setting };
    this.setState({ [C.OTHER_CFG]: newOtherCfg });
  };

  _onOk = () => {
    const state = { ...this.state, lagId: this.state.lagId.toString() };
    this.props.actions.lag.addLag(state);
    this.props.onClose();
  };

  render() {
    const isValid = this.state.availLagIdRange.has(this.state.lagId);
    return (
      <Layer
          className="edit"
          onClose={this.props.onClose}
          closer
          flush
          align="right">
        <Box pad="medium" className="flex1">
          <Title>{t('addLag')}</Title>
          <br/>
          <Tabs>
            <Tab title={t('idAndInterfaces')}>
              <b>{t('lagIdsAvailable')}</b>
              <span>{this.state.availLagIdRange.toString()}</span>
              <NumberInput
                  className={isValid ? null : 'error'}
                  id="lagId"
                  name="lagId"
                  label="lagId"
                  value={this.state.lagId}
                  onChange={this._onChangeNewLagId} />
              <br/>
              <OneToMany
                  fullSetInit={this.availInfsInit}
                  fullSetTitle={t('available')}
                  fullSet={this.state.availInfs}
                  fullSetCols={this.cols}
                  subSetInit={{}}
                  subSetTitle={`LAG ${this.state.lagId}`}
                  subSet={this.state.lagInfs}
                  subSetCols={this.cols}
                  onChange={this._onChangeLag}
                  maxSubSetSize={this.props.settings.LAG_MAX_INTERFACES}
              />
            </Tab>
            <Tab title={t('attributes')}>
              <b>{t('aggrMode')}</b>
              <div>
                <Menu label={t(this.state[C.AGGR_MODE])}>
                  <Anchor
                      onClick={() => this._onChangeMode(C.AGGR_MODE_ACTIVE)}>
                    {t(C.AGGR_MODE_ACTIVE)}
                  </Anchor>
                  <Anchor
                      onClick={() => this._onChangeMode(C.AGGR_MODE_PASSIVE)}>
                    {t(C.AGGR_MODE_PASSIVE)}
                  </Anchor>
                  <Anchor
                      onClick={() => this._onChangeMode(C.AGGR_MODE_OFF)}>
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
                    onChange={
                      () => this._onChangeOtherConfig({[C.RATE]: C.RATE_SLOW})
                    } />
                <RadioButton
                    id="rateFast"
                    label={t('fast')}
                    checked={this.state[C.OTHER_CFG][C.RATE] === 'fast'}
                    onChange={
                      () => this._onChangeOtherConfig({[C.RATE]: C.RATE_FAST})
                    } />
              </FormField>
              <br/>
              <b>{t('fallback')}</b>
              <FormField>
                <RadioButton
                    id="fallbackFalse"
                    label={t('false')}
                    checked={this.state[C.OTHER_CFG][C.FALLBACK] === 'false'}
                    onChange={
                      () => this._onChangeOtherConfig({[C.FALLBACK]: 'false'})
                    } />
                <RadioButton
                    id="fallbackTrue"
                    label={t('true')}
                    checked={this.state[C.OTHER_CFG][C.FALLBACK] === 'true'}
                    onChange={
                      () => this._onChangeOtherConfig({[C.FALLBACK]: 'true'})
                    } />
              </FormField>
              <br/>
              <b>{t('hash')}</b>
              <div>
                <Menu label={t(this.state[C.OTHER_CFG][C.HASH])}>
                  <Anchor onClick={
                    () => this._onChangeOtherConfig({[C.HASH]: C.HASH_L3})
                  }>
                    {t(C.HASH_L3)}
                  </Anchor>
                  <Anchor onClick={
                    () => this._onChangeOtherConfig({[C.HASH]: C.HASH_L2})
                  }>
                    {t(C.HASH_L2)}
                  </Anchor>
                  <Anchor onClick={
                    () => this._onChangeOtherConfig({[C.HASH]: C.HASH_L2_VID})
                  }>
                    {t(C.HASH_L2_VID)}
                  </Anchor>
                  <Anchor onClick={
                    () => this._onChangeOtherConfig({[C.HASH]: C.HASH_L4})
                  }>
                    {t(C.HASH_L4)}
                  </Anchor>
                </Menu>
              </div>
            </Tab>
          </Tabs>
          <hr style={{minWidth: '544px'}}/>
          <Footer pad={{vertical: 'medium'}}>
            <Menu>
              <Button
                  label={t('ok')}
                  primary
                  onClick={isValid ? this._onOk : null}/>
            </Menu>
          </Footer>
        </Box>
      </Layer>
    );
  }
}

const select = (store) => ({
  settings: store.settings,
  lag: store.lag
});

export default connect(select)(LagAdd);
