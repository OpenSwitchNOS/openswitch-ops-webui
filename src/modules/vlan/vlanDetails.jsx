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
import Title from 'grommet/components/Title';
import Box from 'grommet/components/Box';
import _ from 'lodash';


class VlanDetails extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    collector: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
    vlan: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.fid = _.uniqueId('vlanForm_');
    this.state = {
      editMode: false,
    };
  }

  _id = s => `${this.fid}_${s}`;

  _onClose = () => {
    this.props.history.pushState(null, `/vlan`);
  };

  _onEditToggle = () => {
    const editMode = !this.state.editMode;
    this.setState({ editMode });
  };

  _onEditSubmit = () => {
    this._onEditToggle();
  };

  render() {
    const id = this.props.params.id;
    // TODO: not implemented yet
    // const infs = this.props.collector.overview.interfaces;
    // const ports = this.props.vlan.page.ports;
    const title = `${t('vlan')}: ${id}`;
    // const vlans = this.props.vlan.page.vlans;

    return (
      <Box pad="small" className="details min200x400">
        <Header tag="h4" justify="between">
          <Title>{title}</Title>
        </Header>
        <hr/>
      </Box>
    );
  }
}

function select(store) {
  return {
    collector: store.collector,
    vlan: store.vlan,
  };
}

export default connect(select)(VlanDetails);
