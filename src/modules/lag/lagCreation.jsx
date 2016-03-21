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
import _ from 'lodash';
import Layer from 'grommet/components/Layer';
import Header from 'grommet/components/Header';
import Footer from 'grommet/components/Footer';
import Menu from 'grommet/components/Menu';
import Form from 'grommet/components/Form';
import FormField from 'grommet/components/FormField';
import FormFields from 'grommet/components/FormFields';
import Button from 'grommet/components/Button';
import Validator from 'grommet/utils/Validator';
import Title from 'grommet/components/Title';
import { t } from 'i18n/lookup.js';
import Box from 'grommet/components/Box';

class LagCreation extends Component {

  static propTypes = {
    history: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.fid = _.uniqueId('lagCreationForm_');
    this.state = {
      lag: {
        lagId: '',
        aggregationMode: 'static',
        lagSpeed: '',
        lagFallBack: '',
      },
      validation: {errors: {}},
    };
  }
//TODO: isDirty should be moved to a new component for checking stuff.
isDirty = () => {
  if (this.state.validation.valid) {
    return !_.isEqual(this.state.lag.lagId, '');
  }
};
  _validate = () => {
    const lag = this.state.lag;
    const rules = [
      {
        field: 'lagId',
        tests: [
          {
            test: !lag.lagId,
            message: 'Lag ID is required'
          },
          {
            test: lag.lagId < 1 || lag.lagId > 2000,
            message: 'Lag ID should be in range of 1 to 2000'
          },
          {
            test: isNaN(lag.lagId),
            message: 'Lag ID should be a Number'
          },
        ]
      }
    ];
    return Validator.validate(rules);
  };

  _onChange = (e) => {
    const fn = e.target.getAttribute('name');
    const lag = { ...this.state.lag, [fn]: e.target.value };
    this.setState({ lag, validation: this._validate() });
  };


  _onClose = () => {
    this.setState({newLag: false});
  };

  _id = s => `${this.fid}_${s}`;

  _onSubmit = () => {
    if (this.state.validation.valid) {
      const lag = this.normalizeLagConfig(this.state.lag);
      this.props.onSubmit(lag);
    }
  };


//TODO: Should go into a Util component
//TODO: have to unit test this method
  normalizeLagConfig(lag) {
    const DEF_LAG_USER_CFG = {
      aggregationMode: 'off',
    };
    if (lag.aggregationMode === 'static') {
      lag.aggregationMode = DEF_LAG_USER_CFG.aggregationMode;
    }
    return lag;
  }


render() {
  //TODO : localize
  const validation = this.state.validation;
  const errors = validation.errors;
  const lag = this.state.lag;
  return (
    <Layer
        className="edit"
        onClose={this.props.onClose}
        closer
        flush
        align="right"
        >
    <Box pad="small" className="details min200x400">
    <Form className="mLeft" onSubmit={this._onSubmit}>
    <Header>
      <Title>Add a LAG</Title>
    </Header>
    <hr/>
    <FormFields>
    <fieldset>
    <h4><b>{t('id')}</b></h4>
    <FormField label="LagID" htmlFor={this._id('lagId')}
        error={errors.lagId}>
    <input id={this._id('lagId')} name="lagId" type="text"
        value={lag.lagId} onChange={this._onChange} />
    </FormField>
    </fieldset>
    </FormFields>
    <br/>
    <FormFields>
    <fieldset>
    <h4><b>{t('aggregationMode')}</b></h4>
  <FormField label="Aggregation Mode" htmlFor={this._id('aggregationMode')}
      error={errors.mode}>
    <select id={this._id('aggregationMode')} name="aggregationMode"
        value={lag.aggregationMode} onChange={this._onChange} >
        <option value="static">static</option>
        <option value="active">active</option>
        <option value="passive">passive</option>
  </select>
  </FormField>
  </fieldset>
  </FormFields>
  <br/>
  <FormFields>
  <fieldset>
  <h4><b>{t('speed')}</b></h4>
    <FormField label="Speed" htmlFor={this._id('speed')}
        error={errors.speed}>
      <input id={this._id('lagSpeed')} name="lagSpeed" type="text"
          value={lag.lagSpeed} onChange={this._onChange} />
    </FormField>
  </fieldset>
  </FormFields>
  <br/>
  <FormFields>
    <fieldset>
    <h4><b>{t('fallBack')}</b></h4>
      <FormField label="FallBack" htmlFor={this._id('fallBack')}
          error={errors.speed}>
        <input id={this._id('lagFallBack')} name="lagFallBack" type="text"
            value={lag.lagFallBack} onChange={this._onChange} />
      </FormField>
    </fieldset>
  </FormFields>
  <br/>
  <Footer pad={{vertical: 'medium'}}>
    <Menu>
      <Button label="Add" primary
          onClick={this.isDirty() ? this._onSubmit : null} />
    </Menu>
  </Footer>
  </Form>
  </Box>
  </Layer>
  );
}
}

const select = (store) => ({ lag: store.lag });

export default connect(select)(LagCreation);
