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
import Header from 'grommet/components/Header';
import Form from 'grommet/components/Form';
import Menu from 'grommet/components/Menu';
import Footer from 'grommet/components/Footer';
import Button from 'grommet/components/Button';

import { t } from 'i18n/lookup.js';

export default class Confirm extends Component {

  static propTypes = {
    message: PropTypes.string,
    onSubmit: PropTypes.func.isRequired,
    submitLabel: PropTypes.string,
    title: PropTypes.string,
  }

  static defaultProps = {
    prefix: 'confirmForm',
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  _onSubmit = (event) => {
    event.preventDefault();
    if (this.state.acknowledged) {
      this.props.onSubmit();
    } else {
      this.setState({error: t('required')});
    }
  }

  render() {
    return (
      <Form onSubmit={this._onSubmit}>
        <Header>
          <h2>{this.props.title || t('confirmation')}</h2>
        </Header>
        <p>{this.props.message || t('areYouSure')}</p>
        <Footer pad={{vertical: 'medium'}}>
          <Menu>
            <Button label={this.props.submitLabel || t('yes')}
                primary onClick={this.props.onSubmit} />
          </Menu>
        </Footer>
      </Form>
    );
  }

}
