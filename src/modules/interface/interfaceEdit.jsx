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
    actions: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.pad = {horizontal: 'small', vertical: 'small'};
    this.fid = _.uniqueId('infEdit_');
    this.state = { ...props.user };
  }

  _isDirty = () => {
    return !_.isEqual(this.state, this.props.user);
  };

  _onSubmit = () => {
    this.props.onSubmit({ ...this.state });
  };

  _id = s => `${this.fid}_${s}`;

  _onChangeAdminConfigUp = () => this.setState({ adminUserUp: true });

  _onChangeAdminConfigDown = () => this.setState({ adminUserUp: false });

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
            <Title>{`${t('edit')} ${t('interface')}: ${this.state.id}`}</Title>
          </Header>
          <hr/>
          <Form>
            <Header>
              <h3>{t('adminUser')}</h3>
            </Header>
            <FormFields>
              <fieldset>
                <FormField>
                  <RadioButton
                      id={this._id('adminConfigUp')}
                      label={t('up')}
                      checked={this.state.adminUserUp}
                      onChange={this._onChangeAdminConfigUp} />
                  <RadioButton
                      id={this._id('adminConfigDown')}
                      label={t('down')}
                      checked={!this.state.adminUserUp}
                      onChange={this._onChangeAdminConfigDown} />
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
