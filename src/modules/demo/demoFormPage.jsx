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

import Header from 'grommet/components/Header';
import Footer from 'grommet/components/Footer';
import Menu from 'grommet/components/Menu';
import Form from 'grommet/components/Form';
import FormField from 'grommet/components/FormField';
import FormFields from 'grommet/components/FormFields';
import Button from 'grommet/components/Button';
import RadioButton from 'grommet/components/RadioButton';
import CheckBox from 'grommet/components/CheckBox';
import Validator from 'grommet/utils/Validator';


class DemoFormPage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    demo: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.fid = _.uniqueId('demoForm_');
    this.state = {
      user: {
        login: '',
        name: '',
        password: '',
        role: 'specialized',
        backupAdmin: false,
        networkAdmin: false,
        serverAdmin: false,
        storageAdmin: false,
        email: '',
        officePhone: '',
        mobilePhone: '',
      },
      validation: {errors: {}},
    };
  }

  _onSubmit = () => {
    alert('Submit!');
  };

  _validate = () => {
    const user = this.state.user;
    const rules = [
      {
        field: 'login',
        test: !user.login,
        message: 'required'
      },
      {
        field: 'password',
        tests: [
          {
            test: !user.password,
            message: 'required'
          },
          {
            test: user.password.length < 8,
            message: 'must be at least 8 characters'
          },
        ]
      }
    ];
    return Validator.validate(rules);
  };

  _onChange = (e) => {
    const fn = e.target.getAttribute('name');
    const user = { ...this.state.user, [fn]: e.target.value };
    this.setState({ user, validation: this._validate() });
  };

  _onChangeCheckBox = (e) => {
    const fn = e.target.getAttribute('name');
    const user = {...this.state.user, [fn]: e.target.checked };
    this.setState({ user, validation: this._validate() });
  };

  _id = s => `${this.fid}_${s}`;

  render() {
    const validation = this.state.validation;
    const errors = validation.errors;
    const user = this.state.user;
    return (
      <Form className="mLeft" onSubmit={this._onSubmit}>
        <Header>
          <h1>Add User</h1>
        </Header>
        <FormFields>

          <fieldset>
            <FormField label="Login name" htmlFor={this._id('login')}
                error={errors.login}>
              <input id={this._id('login')} name="login" type="text"
                  value={user.login} onChange={this._onChange} />
            </FormField>
            <FormField label="Password" htmlFor={this._id('pwd')}
                error={errors.password}>
              <input id={this._id('pwd')} name="password" type="password"
                  value={user.password} onChange={this._onChange} />
            </FormField>
          </fieldset>

          <fieldset>
            <legend>Role</legend>
            <FormField>
              <RadioButton id={this._id('roleSp')} name="role"
                  label="Specialized" value="specialized"
                  checked={user.role === 'specialized'}
                  onChange={this._onChange} />
              <FormField hidden={user.role !== 'specialized'}>
                <CheckBox id={this._id('subRoleBu')} name="backupAdmin"
                    label="Backup administrator"
                    checked={user.backupAdmin}
                    onChange={this._onChangeCheckBox} />
                <CheckBox id={this._id('subRoleNet')} name="networkAdmin"
                    label="Network administrator"
                    checked={user.networkAdmin}
                    onChange={this._onChangeCheckBox} />
                <CheckBox id={this._id('subRoleSvr')} name="serverAdmin"
                    label="Server administrator"
                    checked={user.serverAdmin}
                    onChange={this._onChangeCheckBox} />
                <CheckBox id={this._id('subRoleStor')} name="storageAdmin"
                    label="Storage administrator"
                    checked={user.storageAdmin}
                    onChange={this._onChangeCheckBox} />
              </FormField>
            </FormField>
            <FormField>
              <RadioButton id={this._id('roleFull')} name="role" label="Full"
                  value="full" checked={user.role === 'full'}
                  onChange={this._onChange} />
            </FormField>
            <FormField>
              <RadioButton id={this._id('roleRdOnly')} name="role"
                  label="Read only" value="read-only"
                  checked={user.role === 'read-only'}
                  onChange={this._onChange} />
            </FormField>
          </fieldset>

          <fieldset>
            <legend>Contact</legend>
            <FormField label="Email" htmlFor={this._id('email')}>
              <input id={this._id('email')} name="email" type="text"
                  value={user.email} onChange={this._onChange} />
            </FormField>
          </fieldset>
        </FormFields>
        <Footer pad={{vertical: 'medium'}}>
          <Menu>
            <Button label="Add" primary
                onClick={validation.valid && this._onSubmit} />
          </Menu>
        </Footer>
        <p>
          {`login: ${this.state.user.login}`}<br/>
          {`password: ${this.state.user.password}`}<br/>
          {`role: ${this.state.user.role}`}<br/>
          {`backupAdmin: ${this.state.user.backupAdmin}`}<br/>
          {`networkAdmin: ${this.state.user.networkAdmin}`}<br/>
          {`serverAdmin: ${this.state.user.serverAdmin}`}<br/>
          {`storageAdmin: ${this.state.user.storageAdmin}`}<br/>
          {`email: ${this.state.user.email}`}<br/>
          {`validation.valid: ${validation.valid}`}<br/>
          {`validation.firstError: ${validation.firstError}`}<br/>
        </p>
      </Form>
    );
  }

}

const select = (store) => ({ demo: store.demo });

export default connect(select)(DemoFormPage);
