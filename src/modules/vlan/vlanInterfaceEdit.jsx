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
import Range from 'range.js';
import Button from 'grommet/components/Button';
import _ from 'lodash';
import VlanAdd from './vlanAdd.jsx';


class VlanInterfaceEdit extends Component {

  static propTypes = {
    data: PropTypes.object.isRequired,
    interfaceId: PropTypes.string.isRequired,
    onAddVlan: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired,
    ports: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.pad = {horizontal: 'small', vertical: 'small'};
    this.fid = _.uniqueId('vlanInfEdit_');
    const id = this.props.interfaceId;
    const cfg = { ...this.props.ports[id] };
    this.state = {
      addMode: false,
      cfg
    };
  }

  _isDirty = () => {
    const id = this.props.interfaceId;
    return !_.isEqual(this.state.cfg, this.props.ports[id] );
  };

  _onOk = () => {
    this.props.onOk(this.props.data, this.state.cfg);
  };

  _id = s => `${this.fid}_${s}`;

  _onChangeAccessVlanId = (evt) => {
    const cfg = { ...this.state.cfg, tag: evt.target.value };
    this.setState({ cfg });
  };

  _onAddOpen = () => {
    this.setState({ addMode: true });
  };

  _onAddApply = (cfg) => {
    // TODO: Need to standardize the data and new cfg to set methods...see interface Dux.
    this.props.onAddVlan(this.props.data.vlans, cfg);
  };

  _onAddOk = (data) => {
    this._onAddApply(data);
    this.setState({ addMode: false });
  };

  _onAddClose = () => {
    this.setState({ addMode: false });
  };

  render() {
    // TOOD: Move to BL.
    const vlanIds = Object.keys(this.props.data.vlans);
    const range = new Range(vlanIds.map( k => Number(k) ));
    const isValid = this.state.cfg.tag && range.has(this.state.cfg.tag);
    const err = isValid || !this.state.cfg.tag ? null : t('invalid');
    const allowSet = this._isDirty() && isValid;

    const addLayer = !this.state.addMode ? null :
      <VlanAdd
          onClose={this._onAddClose}
          onOk={this._onAddOk}
          onApply={this._onAddApply}
          vlans={this.props.data.vlans}
      />;

    // TODO: The addLayer is same z-index as this edit layer?
    return (
      <Layer
          className="edit"
          onClose={this.props.onClose}
          closer
          flush
          align="right">
          {addLayer}
        <Box pad="small" className="flex1">
          <Header tag="h4" justify="between" pad={{horizontal: 'medium'}}>
            <Title>
            {`${t('edit')} ${t('interface')}: ${this.props.interfaceId}`}
            </Title>
          </Header>
          <hr/>
          <Form>
            <FormFields>
              <fieldset>
                <legend>{`${t('new')} ${t('accessVlanId')}`}</legend>
                <FormField
                    label={`${t('available')}: ${range.toString()}`}
                    error={err}>
                  <input
                      id={this._id('accessVlanId')}
                      onChange={this._onChangeAccessVlanId}
                      value={this.state.cfg.tag}
                      type="number"/>
                </FormField>
              </fieldset>
            </FormFields>
            <Footer pad={{vertical: 'medium'}}>
              <Menu direction="row" justify="end">
                <Button
                    label={t('deploy')}
                    primary
                    onClick={allowSet ? this._onOk : null}/>
                <Button
                    label={t('addVlan')}
                    primary
                    onClick={this._onAddOpen}/>
              </Menu>
            </Footer>
          </Form>
        </Box>
      </Layer>
    );
  }
}

export default VlanInterfaceEdit;
