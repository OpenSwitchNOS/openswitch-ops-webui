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
import { Link } from 'react-router';
import { connect } from 'react-redux';
import Sidebar from 'grommet/components/Sidebar';
import Header from 'grommet/components/Header';
import Footer from 'grommet/components/Footer';
import Title from 'grommet/components/Title';
// import Logo from './Logo'; // './HPELogo';
import Menu from 'grommet/components/Menu';
import Anchor from 'grommet/components/Anchor';
import CloseIcon from 'grommet/components/icons/base/Close';
import Section from 'grommet/components/Section';
import Layer from 'grommet/components/Layer';
import Form from 'grommet/components/Form';
import FormField from 'grommet/components/FormField';
import FormFields from 'grommet/components/FormFields';
import Button from 'grommet/components/Button';

import { t } from 'i18n/lookup.js';


class DemoLayerPage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    demo: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  _onOpenDialog = () => {
    this.setState({ dialog: true });
  }

  _onOpenEdit = () => {
    this.setState({ edit: true });
  }

  _onClose = () => {
    this.setState({ dialog: false });
    this.setState({ edit: false });
  }

  render() {
    return (
      <div>
        <p>
          <Button label="Modal" onClick={this._onOpenDialog}/>
        </p>
        {this.state.dialog ?
          <Layer onClose={this._onClose} closer={true} flush={true}
              align="top">
            <Form>
              <Header>
                <h2>Dialog Title</h2>
              </Header>
              <FormFields>
                <p>This is a simple dialog.</p>
              </FormFields>
            </Form>
          </Layer> : null
        }

        <p>
          <Button label="Edit" onClick={this._onOpenEdit}/>
        </p>
        {
          this.state.active2 ?
          <Layer onClose={this._onClose} closer={true} flush={true}
              align="right">
            <p>Edit Here</p>
          </Layer> : null
        }

      </div>
    );
  }

}

const select = (state) => ({ demo: state.demo });

export default connect(select)(DemoLayerPage);
