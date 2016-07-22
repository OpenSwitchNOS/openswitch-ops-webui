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

import './loginLayer.scss';

import React, { PropTypes, Component } from 'react';
import LoginForm from 'grommet/components/LoginForm';
import Layer from 'grommet/components/Layer';


export default class LoginLayer extends Component {

  static propTypes = {
    logo: PropTypes.element,
    logoText: PropTypes.string,
    onSubmit: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Layer id="loginLayer" flush align="top">
        <LoginForm
            logo={this.props.logo}
            usernameType="text"
            title={this.props.logoText}
            onSubmit={this.props.onSubmit}
        />
      </Layer>
    );
  }

}
