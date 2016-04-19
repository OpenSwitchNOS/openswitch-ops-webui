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
import Layer from 'grommet/components/Layer';
import Menu from 'grommet/components/Menu';
import Button from 'grommet/components/Button';
import Title from 'grommet/components/Title';
import FormField from 'grommet/components/FormField';
import Footer from 'grommet/components/Footer';
import Anchor from 'grommet/components/Anchor';
import RadioButton from 'grommet/components/RadioButton';
import Box from 'grommet/components/Box';
import Tabs from 'grommet/components/Tabs';
import Tab from 'grommet/components/Tab';
import OneToMany from 'oneToMany.jsx';
import * as C from './lagConst.js';
import _ from 'lodash';


class LagEdit extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    lag: PropTypes.object.isRequired,
    lagId: PropTypes.string.isRequired,
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

    const lagId = props.lagId;
    const lag = props.lag.lags[lagId];

    this.availInfsInit = { ...props.lag.availInterfaces };
    this.lagInfsInit = { ...lag.interfaces };
    this.initAggrMode = lag[C.AGGR_MODE];
    this.initOtherCfg = {
      [C.RATE]: lag[C.RATE],
      [C.FALLBACK]: lag[C.FALLBACK],
      [C.HASH]: lag[C.HASH],
    };

    this.state = {
      lagId,
      availInfs: { ...this.availInfsInit },
      lagInfs: { ...this.lagInfsInit },
      diff: { addedCount: 0, added: {}, removedCount: 0, removed: {}, },
      [C.AGGR_MODE]: this.initAggrMode,
      [C.OTHER_CFG]: { ...this.initOtherCfg },
    };
  }

  _onChangeLag = (lagInfs, availInfs, diff) => {
    this.setState({ lagInfs, availInfs, diff });
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
    this.props.actions.lag.editLag(state);
    this.props.onClose();
  };

  render() {
    const isDirty = this.state.diff.addedCount > 0 ||
      this.state.diff.removedCount > 0 ||
      this.initAggrMode !== this.state[C.AGGR_MODE] ||
      !_.isEqual(this.initOtherCfg, this.state[C.OTHER_CFG]);

    return (
      <Layer
          className="edit"
          onClose={this.props.onClose}
          closer
          flush
          align="right">
        <Box pad="medium" className="flex1">
          <Title>{`${t('editLag')}: ${this.state.lagId}`}</Title>
          <br/>
          <Tabs>
            <Tab title={t('interfaces')}>
              <OneToMany
                  fullSetInit={this.availInfsInit}
                  fullSetTitle={t('available')}
                  fullSet={this.state.availInfs}
                  fullSetCols={this.cols}
                  subSetInit={this.lagInfsInit}
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
                  onClick={isDirty ? this._onOk : null}/>
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

export default connect(select)(LagEdit);
