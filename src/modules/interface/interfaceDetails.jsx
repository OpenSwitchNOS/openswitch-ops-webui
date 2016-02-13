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
import _ from 'lodash';


// TODO: needs to be cleaned up top to bottom.
/* TODO: below
We need to clean up:
adminState 'up'/'down' vs enabled t/f
  Pain to check for string everywhere
  LLDP/ECMP also have this problem -> convert to t/f
  Clean up related code in collector & interface modules
*/
/* TODO: need to create a dialog helper for edit errors.
if (!p.isFetching) {
  if (e) {
    status = (
      <SpanStatus onClick={this._onStatusClicked} value="error">
        {e.title}
      </SpanStatus>
    );
    if (this.state.showDetail) {
      detail = (
        <StatusLayer value="error" onClose={this._onCloseDetail}
            title={e.title} >
          <b>{t('status')}</b><br/>
          {e.status || t('none')}
          <p/>
          <b>{t('url')}</b><br/>
          {e.url}
          {e.msg ? <p><i>"{e.msg}"</i></p> : null}
        </StatusLayer>
      );
    }
  } else if (p.date) {
    status = <small><TimeAgo date={p.date}/></small>;
  }
}
*/


class InterfaceDetails extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    autoActions: PropTypes.object.isRequired,
    collector: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    interface: PropTypes.object.isRequired,
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      user: {},
    };
  }

  componentDidMount() {
    this.props.actions.interface.fetch(this.props.params.id);
  }

  componentWillReceiveProps(nextProps) {
    const p = this.props;
    const id = p.params.id;
    const currData = p.collector.interfaces[id];
    const nextData = nextProps.collector.interfaces[id];

    if (nextProps.params.id !== id || !_.isEqual(currData, nextData)) {
      p.actions.interface.fetch(nextProps.params.id);
    }
  }

  _onClose = () => {
    this.props.history.pushState(null, `/interface`);
  };

  _onEditToggle = () => {
    const editMode = !this.state.editMode;
    let user = this.state.user;
    if (editMode) {
      user = { adminState: this.props.interface.vAdminState };
    }
    this.setState({ editMode, user });
  };

  _onChangeCheckBox = (e) => {
    const fn = e.target.getAttribute('name');
    const state = e.target.checked ? 'up' : 'down';
    const user = {...this.state.user, [fn]: state };
    this.setState({ user });
  };

  _onSubmit = () => {
    const actions = this.props.actions.interface;
    const id = this.props.params.id;
    const state = this.state.user.adminState;
    if (state === 'up') {
      actions.adminStateUp(id);
    } else {
      actions.adminStateDown(id);
    }
  };

  render() {
    //TODO: Should be localized eventually
    const id = this.props.params.id;
    const data = this.props.collector.interfaces[id];
    const infData = this.props.interface;
    const user = this.state.user;
    const editLayer = !this.state.editMode ? null : (
      <Layer
          className="edit"
          onClose={this._onEditToggle}
          closer
          flush
          align="right">
        <Form onSubmit={this._onSubmit}>
          <Header>
            <h3> Editing Interface Details </h3>
          </Header>
          <FormFields>
            <fieldset>
            <FormField>
              <CheckBox onChange={this._onChangeCheckBox} checked={user.adminState === 'up'} id="adminState" name="adminState" label="Admin State" toggle/>
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
        <Box pad="small">
        {!data ? 'no data' : (
          <div>
            <h5>ID: {data.id}</h5>
            <h5>Admin State: {data.adminState}</h5>
            <h5>Link State: {data.linkState}</h5>
            <h5>Duplex: {data.duplex}</h5>
            <h5>Speed: {data.speedFormatted}</h5>
            <h5>Connector: {data.connector}</h5>
            <br/>
            <h5>ports etag: {infData.ports.etag}</h5>
            <h5>entity id: {infData.entity.id}</h5>
            <h5>entity etag: {infData.entity.etag}</h5>
            <h5>entity adminState: {infData.entity.adminState}</h5>
            <h5>port id: {infData.port && infData.port.id}</h5>
            <h5>port adminState: {infData.port && infData.port.adminState}</h5>
            <h5>port etag: {infData.port && infData.port.etag}</h5>
            </div>
          )}
        </Box>
        {editLayer}
      </Box>
    );
  }
}

function select(store) {
  return {
    collector: store.collector,
    interface: store.interface,
  };
}

export default connect(select)(InterfaceDetails);
