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
import { t, ud } from 'i18n/lookup.js';
import Header from 'grommet/components/Header';
import Menu from 'grommet/components/Menu';
import Title from 'grommet/components/Title';
import Anchor from 'grommet/components/Anchor';
import Box from 'grommet/components/Box';
import CloseIcon from 'grommet/components/icons/base/Close';
import EditIcon from 'grommet/components/icons/base/Edit';
import RefreshIcon from 'grommet/components/icons/base/Refresh';
import ErrorLayer from 'errorLayer.jsx';
import InterfaceEdit from './interfaceEdit.jsx';
import _ from 'lodash';


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
    this.fid = _.uniqueId('infForm_');
    this.state = {
      editMode: false,
    };
  }

  _id = s => `${this.fid}_${s}`;

  componentDidMount() {
    this.props.actions.interface.fetchDetails(this.props.params.id);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.interface.set.lastSuccessMillis >
        this.props.interface.set.lastSuccessMillis) {

      this.props.actions.collector.fetchImmediate();

    } else if (nextProps.params.id !== this.props.params.id ||
        nextProps.collector.overview.lastSuccessMillis >
        this.props.collector.overview.lastSuccessMillis) {

      this.props.actions.interface.fetchDetails(nextProps.params.id);
    }
  }

  _onClose = () => {
    this.props.history.pushState(null, `/interface`);
  };

  _onEditToggle = () => {
    const editMode = !this.state.editMode;
    this.setState({ editMode });
  };

  _onEditSubmit = (user) => {
    this.props.actions.interface.set(user);
    this._onEditToggle();
  };

  _onCloseError = () => {
    this.props.actions.interface.clearErrorForSet();
  };

  render() {
    const id = this.props.params.id;
    const detail = this.props.interface.detail;
    const set = this.props.interface.set;

    const editLayer = !this.state.editMode ? null :
      <InterfaceEdit
          actions={this.props.actions}
          onClose={this._onEditToggle}
          onSubmit={this._onEditSubmit}
          user={{
            id,
            adminUserUp: detail.inf.adminUserUp,
          }}
      />;

    const errorLayer = !set.lastError ? null :
      <ErrorLayer error={set.lastError} onClose={this._onCloseError} />;

    return (
      <Box pad="small">
        <Header tag="h4" justify="between" pad={{horizontal: 'medium'}}>
          <Title>{`${t('interface')}: ${id}`}</Title>
          <Menu direction="row" justify="end" responsive={false}>
            <Anchor onClick={set.inProgress ? null : this._onEditToggle}>
              {set.inProgress ? <RefreshIcon className="spin"/> : <EditIcon/>}
            </Anchor>
            <Anchor onClick={this._onClose}>
              <CloseIcon/>
            </Anchor>
          </Menu>
        </Header>
        <hr/>
        <div>
          <b>collector adminUserUp</b>{ud(this.props.collector.overview.interfaces[id] && this.props.collector.overview.interfaces[id].adminUserUp)}<br/>
          <br/>
          <b>detail.inf.adminUserUp</b>{ud(detail.inf.adminUserUp)}<br/>
          <b>detail.inf.etag</b>{detail.inf.etag}<br/>
          <br/>
          <b>detail.port.adminUserUp</b>{ud(detail.port.adminUserUp)}<br/>
          <b>detail.port.etag</b>{detail.port.etag}<br/>
          <br/>
          <b>page.ports.etag</b>{this.props.interface.page.portRefs.etag}<br/>
          <br/>
        </div>
        {editLayer}
        {errorLayer}
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
