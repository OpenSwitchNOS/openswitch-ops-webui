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
import Box from 'grommet/components/Box';
import Form from 'grommet/components/Form';
import Title from 'grommet/components/Title';
import Layer from 'grommet/components/Layer';
import SpanStatus from 'spanStatus.jsx';

import { t } from 'i18n/lookup.js';

export default class StatusLayer extends Component {

  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    form: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string,
    value: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const value = this.props.value || 'ok';
    let title = this.props.title;
    if (!title) {
      if (value === 'warning') {
        title = t('warning');
      } else if (value === 'critical') {
        title = t('error');
      } else {
        title = t('information');
      }
    }

    const content = (
      <div>
        <Header>
          <Title>
            <SpanStatus size="large" space={false} value={value}>
              {title}
            </SpanStatus>
          </Title>
        </Header>
        <br/>
        {this.props.children}
      </div>
    );

    const boxOrForm = this.props.form ? <Form>{content}</Form> :
      <Box pad="large">{content}</Box>;

    return (
      <Layer
          className={this.props.className}
          onClose={this.props.onClose}
          closer
          flush
          align="top">
        {boxOrForm}
      </Layer>
    );
  }

}
