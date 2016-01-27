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
import Footer from 'grommet/components/Footer';
import Menu from 'grommet/components/Menu';
import Title from 'grommet/components/Title';
import Anchor from 'grommet/components/Anchor';
import Box from 'grommet/components/Box';
import CloseIcon from 'grommet/components/icons/base/Close';
import CheckBox from 'grommet/components/CheckBox';
import Layer from 'grommet/components/Layer';
import Form from 'grommet/components/Form';
import FormField from 'grommet/components/FormField';
import FormFields from 'grommet/components/FormFields';
import Button from 'grommet/components/Button';
import EditIcon from 'grommet/components/icons/base/Edit';


class VlanDetails extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
    vlan: PropTypes.object.isRequired,
  };


  constructor(props) {
    super(props);
    this.state = {};
  }

  _onClose = () => {
    this.props.history.pushState(null, `/vlan`);
  };

  _onEditToggle = () => {
    const inEditMode = !this.state.inEditMode;
    this.setState({ inEditMode });
  };

  render() {
    const id = this.props.params.id;
    const data = this.props.vlan.entities[id];
    const editLayer = !this.state.inEditMode ? null : (
      <Layer
          className="edit"
          onClose={this._onEditToggle}
          closer
          flush
          align="right">
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
      </Layer>
    );

    return (
      <Box>
        <Header tag="h4" justify="between" pad={{horizontal: 'medium'}}>
          <Title>
            VLAN: {id}
          </Title>
          <Menu direction="row" align="center" responsive={false}>
            <Anchor onClick={this._onEditToggle}>
              <EditIcon />
            </Anchor>
            <Anchor onClick={this._onClose}>
              <CloseIcon />
            </Anchor>
          </Menu>
        </Header>
        <Box>
          {!data ? 'no data' : `ID: ${data.id}`}
        </Box>
        {editLayer}
      </Box>
    );
  }
}

function select(store) {
  return {
    vlan: store.vlan,
  };
}

export default connect(select)(VlanDetails);
