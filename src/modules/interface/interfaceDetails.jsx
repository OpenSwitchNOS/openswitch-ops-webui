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
import Layer from 'grommet/components/Layer';
import Form from 'grommet/components/Form';
import FormField from 'grommet/components/FormField';
import FormFields from 'grommet/components/FormFields';
import CheckBox from 'grommet/components/CheckBox';
import Button from 'grommet/components/Button';
import EditIcon from 'grommet/components/icons/base/Edit';
import Tab from 'grommet/components/Tab';
import Tabs from 'grommet/components/Tabs';


class InterfaceDetails extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    autoActions: PropTypes.object.isRequired,
    collector: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  };


  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.props.autoActions.collector.fetch();
    this.props.actions.toolbar.setFetchTB(
      this.props.collector, this._onRefresh
    );
  }

  _onRefresh = () => {
    this.props.autoActions.collector.fetch();

  };

  componentWillReceiveProps(nextProps) {
    this.props.actions.toolbar.setFetchTB(nextProps.collector, this._onRefresh);
  }

  componentWillUnmount() {
    this.props.actions.toolbar.clear();
  }

  _onClose = () => {
    this.props.history.pushState(null, `/interface`);
  };

  _onEditToggle = () => {
    const inEditMode = !this.state.inEditMode;
    this.setState({ inEditMode });
  };

  _onSubmit = () => {
   //TODO :
  };

  render() {
    //TODO: Should be localized eventually.
    const id = this.props.params.id;
    const data = this.props.collector.interfaces[id];
    const editLayer = !this.state.inEditMode ? null : (
      <Layer
          className="edit"
          onClose={this._onEditToggle}
          closer
          flush
          peek
          align="right">
        <Form onSubmit={this._onSubmit}>
          <Header>
            <h3> Editing Interface Details </h3>
          </Header>
          <FormFields>
            <fieldset>
            <FormField>
              <CheckBox id="admin_state" name="adminState" label="Admin State" toggle/>
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
      <Box pad="small">
        <Header tag="h4" justify="between" pad={{horizontal: 'medium'}}>
        <Title>
          Interface {id} Details
        </Title>
        <Menu direction="row" justify="end" responsive={false}>
          <Anchor onClick={this._onEditToggle}>
            <EditIcon className="tiny"/>
          </Anchor>
          <Anchor onClick={this._onClose}>
            <CloseIcon className="tiny"/>
          </Anchor>
        </Menu>
        </Header>
        <Menu direction="row" justify="end" inline label="Menu">
          <Tabs initialIndex={0}>
            <Tab title="Interfaces">
              <Box pad="small">
                {!data ? 'no data' : (
                  <div>
                  <h5>ID: {data.id}</h5>
                  <h5>Admin State: {data.adminState}</h5>
                  <h5>Link State: {data.linkState}</h5>
                  <h5>Duplex: {data.duplex}</h5>
                  <h5>Speed: {data.speed}</h5>
                  <h5>Connector: {data.connector}</h5>
                  </div>
                )}
              </Box>
            </Tab>
            <Tab title="VLANs">
              <h3>
                <center>VLANs</center>
              </h3>
            </Tab>
            <Tab title="Information">
            <h3>
              <center>Information Tab</center>
            </h3>
            </Tab>
          </Tabs>
        </Menu>
        {editLayer}
      </Box>
    );
  }
}

function select(store) {
  return {
    collector: store.collector,
  };
}

export default connect(select)(InterfaceDetails);
