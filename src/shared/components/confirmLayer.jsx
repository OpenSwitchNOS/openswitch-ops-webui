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
import Menu from 'grommet/components/Menu';
import Footer from 'grommet/components/Footer';
import Button from 'grommet/components/Button';
import Layer from 'grommet/components/Layer';
import Title from 'grommet/components/Title';
import SpanStatus from 'spanStatus.jsx';

import { t } from 'i18n/lookup.js';

export default class ConfirmLayer extends Component {

  static propTypes = {
    children: PropTypes.node,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    submitLabel: PropTypes.string,
    title: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  _onSubmit = (event) => {
    event.preventDefault();
    this.props.onSubmit();
  };

  render() {
    return (
      <Layer
          onClose={this.props.onClose}
          closer
          flush
          className="confirm"
          align="top">
        <Box pad="large">
          <Header>
            <Title>
              <SpanStatus size="large" space={false} value="unknown">
                {this.props.title || t('confirmation')}
              </SpanStatus>
            </Title>
          </Header>
          <p>{this.props.children || t('areYouSure')}</p>
          <Footer pad={{vertical: 'medium'}}>
            <Menu>
              <Button label={this.props.submitLabel || t('yes')}
                  primary onClick={this.props.onSubmit} />
            </Menu>
          </Footer>
        </Box>
      </Layer>
    );
  }

}
