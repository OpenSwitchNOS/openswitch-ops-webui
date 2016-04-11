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

// TODO: over 80 columns, rethink name

class PasswordChange extends Component {

  static propTypes = {
    history: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.fid = _.uniqueId('passwordChangeForm_');
    this.state = {
      changePw: {
        oldPw: '',
        newPw: '',
        confirmNewPw: '',
      },
      validation: {errors: {}},
    };
  }
//TODO: isDirty should be moved to a new component for checking stuff.
  isDirty = () => {
    if (this.state.validation.valid) {
      return _.isEqual(this.state.changePw.confirmNewPw, this.state.changePw.newPw);
    }
  };

  isPwMatched = () => this.state.changePw.confirmNewPw === this.state.changePw.newPw;

  _validate = () => {
    const changePw = this.state.changePw;
    const rules = [
      {
        field: 'oldPw',
        tests: [
          {
            test: (changePw.oldPw == null || changePw.oldPw.length <= 0),
            message: 'Old password is required'
          },
        ],
      },
      {
        field: 'newPw',
        tests: [
          {
            test: changePw.newPw.length < 1,
            message: 'New password is required'
          },
        ]
      },

    ];
    return Validator.validate(rules);
  };

  _onChange = (e) => {
    const fieldName = e.target.getAttribute('name');
    const changePw = { ...this.state.changePw, [fieldName]: e.target.value };
    this.setState({ changePw, validation: this._validate() });
  };

  _id = s => `${this.fid}_${s}`;

  _onSubmit = () => {
    if (this.state.validation.valid) {
      const changePw = this.state.changePw;
      this.props.onSubmit(changePw);
    }

  };

render() {
  const validation = this.state.validation;
  const errors = validation.errors;
  const changePw = this.state.changePw;
  return (
    <Layer
        onClose={this.props.onClose}
        closer
        flush
        align="right"
        >
    <Box pad="small" className="details min75x125">
    <Form className="mLeft" onSubmit={this._onSubmit}>
    <Header>
      <Title>Change Password</Title>
    </Header>
    <hr/>
    <FormFields>
    <fieldset>
    <h4><b>{t('oldPw')}</b></h4>
    <FormField htmlFor={this._id('oldPw')}
        error={errors.oldPw}>
    <input id={this._id('oldPw')} name="oldPw" type="password"
        value={changePw.oldPw} onChange={this._onChange} />
    </FormField>
    </fieldset>
    </FormFields>
    <br/>

    <FormFields>
    <fieldset>
    <h4><b>{t('newPw')}</b></h4>
    <FormField htmlFor={this._id('newPw')}
        error={errors.newPw}>
    <input id={this._id('newPw')} name="newPw" type="password"
        value={changePw.newPw} onChange={this._onChange} />
    </FormField>
    </fieldset>
    </FormFields>
    <br/>

    <FormFields>
    <fieldset>
    <h4><b>{t('confirmNewPw')}</b></h4>
    <FormField htmlFor={this._id('confirmNewPw')}
        error={errors.confirmNewPw}>
    <input id={this._id('confirmNewPw')} name="confirmNewPw" type="password"
        value={changePw.confirmNewPw} onChange={this._onChange} />
    </FormField>
    </fieldset>
    </FormFields>
    <br/>
  <Footer pad={{vertical: 'medium'}}>
    <Menu>
      <Button label="Change" primary
          onClick={this.isDirty() ? this._onSubmit : null} />
    </Menu>
  </Footer>
  </Form>
  </Box>
  </Layer>
  );
}
}

const select = (store) => ({
  auth: store.auth,
});

export default connect(select)(PasswordChange);
