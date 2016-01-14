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
import { t } from 'i18n/lookup.js';

import Header from 'grommet/components/Header';
import CheckBox from 'grommet/components/CheckBox';
import Layer from 'grommet/components/Layer';
import Form from 'grommet/components/Form';
import FormField from 'grommet/components/FormField';
import FormFields from 'grommet/components/FormFields';
import Button from 'grommet/components/Button';
import Menu from 'grommet/components/Menu';
import Footer from 'grommet/components/Footer';

import ConfirmLayer from 'confirmLayer.jsx';
import StatusLayer from 'statusLayer.jsx';

class DemoLayerPage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    demo: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  _onOpenInfo = () => {
    this.setState({ info: true });
  };

  _onOpenError = () => {
    this.setState({ error: true });
  };

  _onOpenWarning = () => {
    this.setState({ warning: true });
  };

  _onOpenDialog1 = () => {
    this.setState({ dialog1: true });
  };

  _onOpenDialog2 = () => {
    this.setState({ dialog2: true });
  };

  _onOpenEdit = () => {
    this.setState({ edit: true });
  };

  _onClose = () => {
    this.setState({ info: false });
    this.setState({ error: false });
    this.setState({ warning: false });
    this.setState({ dialog1: false });
    this.setState({ dialog2: false });
    this.setState({ edit: false });
  };

  _onSubmit = () => {
    alert('Make it so!');
    this._onClose();
  };

  render() {
    return (
      <div className="mLeft">

        <p>
          <Button label="Info" onClick={this._onOpenInfo}/>
        </p>
        {this.state.info ?
          <StatusLayer onClose={this._onClose}>
            The text.
          </StatusLayer> : null
        }

        <p>
          <Button label="Error" onClick={this._onOpenError}/>
        </p>
        {this.state.error ?
          <StatusLayer value="error" onClose={this._onClose}>
            The text.
          </StatusLayer> : null
        }

        <p>
          <Button label="Warning-Configured" onClick={this._onOpenWarning}/>
        </p>
        {this.state.warning ?
          <StatusLayer title="This is a warning" value="warning"
              onClose={this._onClose}>
            The text.
          </StatusLayer> : null
        }

        <p>
          <Button label="Confirm-Defaults" onClick={this._onOpenDialog1}/>
        </p>
        {this.state.dialog1 ?
          <ConfirmLayer onClose={this._onClose} onSubmit={this._onSubmit}>
            The text.
          </ConfirmLayer> : null
        }

        <p>
          <Button label="Confirm-Configured" onClick={this._onOpenDialog2}/>
        </p>
        {this.state.dialog2 ?
          <ConfirmLayer onClose={this._onClose}
              title="Awaiting Confirmation"
              submitLabel="Engage"
              onSubmit={this._onSubmit}>
            Captain, course has been set for the Neutral Zone at Warp factor 10
          </ConfirmLayer> : null
        }

        <p>
          <Button label="Edit" onClick={this._onOpenEdit}/>
        </p>
        {
          this.state.edit ?
          <Layer onClose={this._onClose} closer flush align="right">
            <Form onSubmit={this._onSubmit}>
              <Header>
                <h2>Edit Some Things</h2>
              </Header>
              <FormFields>
                <fieldset>
                  <legend>First section</legend>
                  <FormField label="Item 1" htmlFor="ffItem1"
                      help="Some helpful text">
                    <input id="ffItem1" name="ffItem1" type="text"/>
                  </FormField>
                  <FormField>
                    <CheckBox id="cbItem2" name="cbItem2" label="Item 2"/>
                  </FormField>
                  <FormField>
                    <CheckBox id="cbItem3" name="cbItem3" label="Item 3"
                        toggle />
                  </FormField>
                </fieldset>
                <fieldset>
                  <legend>Second section</legend>
                  <FormField label="Item 1" htmlFor="ffItem1"
                      help="Some helpful text">
                    <input id="ffItem1" name="ffItem1" type="text"/>
                  </FormField>
                  <FormField>
                    <CheckBox id="cbItem2" name="cbItem2" label="Item 2"/>
                  </FormField>
                  <FormField>
                    <CheckBox id="cbItem3" name="cbItem3" label="Item 3"
                        toggle />
                  </FormField>
                </fieldset>
              </FormFields>
              <Footer pad={{vertical: 'medium'}}>
                <Menu>
                  <Button label={t('deploy')} primary onClick={this._onSubmit}/>
                </Menu>
              </Footer>
            </Form>
          </Layer> : null
        }
      </div>
    );
  }

}

const select = (state) => ({ demo: state.demo });

export default connect(select)(DemoLayerPage);
