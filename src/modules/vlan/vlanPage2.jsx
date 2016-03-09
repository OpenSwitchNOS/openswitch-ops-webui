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
import Box from 'grommet/components/Box';
import ResponsiveBox from 'responsiveBox.jsx';
import DataGrid, { CustomCell } from 'dataGrid.jsx';
import { MultiRange as Range } from 'multi-integer-range';
import VlanInterfaceEdit from './vlanInterfaceEdit.jsx';


class VlanPage2 extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    autoActions: PropTypes.object.isRequired,
    children: PropTypes.node,
    collector: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    params: PropTypes.shape({
      id: PropTypes.string
    }),
    vlan: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.portCols = [
      {
        columnKey: 'id',
        header: t('interface'),
        width: 160,
      },
      {
        columnKey: 'mode',
        header: t('vlanMode'),
        width: 160,
      },
      {
        columnKey: 'tag',
        header: t('tag'), // TODO: do we want to change the data to access/native?
        width: 100,
      },
      {
        columnKey: 'trunks',
        header: t('trunks'),
        width: 200,
        cell: this._onCustomCell,
        flexGrow: 1,
      },
    ];
    this.state = {
      id: null,
      editMode: false,
    };
  }

  _onCustomCell = (cellData, cellProps) => {
    // TOOD: this should be moved into Utils.
    const range = new Range(cellData);
    const vlanIdStr = range.toString().split(',').join(', ');
    return (
      <CustomCell {...cellProps}>
        {vlanIdStr}
      </CustomCell>
    );
  };

  componentDidMount() {
    this.props.actions.vlan.fetch();
    this.props.actions.toolbar.setFetchTB(
      this.props.vlan.page,
      this._onRefresh
    );
  }

  _onRefresh = () => {
    this.props.actions.vlan.fetch();
    this.props.autoActions.collector.fetch();
  };

  componentWillReceiveProps(nextProps) {
    // TODO: this is same code all over now.
    if (nextProps.vlan.set.lastSuccessMillis >
        this.props.vlan.set.lastSuccessMillis) {
      this.props.actions.vlan.fetch(); // TODO: need to bypass cooldown
    }
    this.props.actions.toolbar.setFetchTB(
      nextProps.vlan.page,
      this._onRefresh
    );
  }

  componentWillUnmount() {
    this.props.actions.toolbar.clear();
  }

  _onEditOpen = () => {
    this.setState({ editMode: true });
  };

  // TODO: decide on OK vs Deploy (Apply and OK, is better then Apply and Deploy)
  _onEditOk = (data, cfg) => {
    this.props.actions.vlan.editVlanInterface(data, cfg);
    // TODO: this should wait until success or failure
    this.setState({ editMode: false });
  };

  _onAddVlan = (vlans, cfg) => {
    // TODO: this should wait until success or failure
    this.props.actions.vlan.addVlan(vlans, cfg);
  };

  _onEditClose = () => {
    this.setState({ editMode: false });
  };

  _onSelect = (sel) => {
    this.setState({ id: sel });
  };

  render() {
    const ports = { ...this.props.vlan.page.interfaces }; // FIXME: naming confusing
    // TODO: This is a big time hack but I don't have time right now
    const infs = this.props.collector.overview.interfaces;
    Object.getOwnPropertyNames(infs).forEach( id => {
      if (!ports[id]) {
        ports[id] = {
          id,
          tag: null,
          trunks: [],
          mode: '',
        };
      }
    });

    // TODO: put this in the collector so we have it for the overview?
    const numPorts = Object.getOwnPropertyNames(ports).length;

    // TODO: How do we want to standardize passing config to an edit component
    // TODO: How do we want to standardize passing data to a component
    const editLayer = !this.state.editMode || !this.state.id ? null :
      <VlanInterfaceEdit
          onClose={this._onEditClose}
          onOk={this._onEditOk}
          onAddVlan={this._onAddVlan}
          interfaceId={this.state.id}
          data={this.props.vlan.page}
          ports={ports}
      />;

    return (
      <Box className="flex1 mTopHalf mLeft">
      {editLayer}
        <ResponsiveBox>
          <DataGrid width={200} height={400}
              title={`(${t('interfaces')}: ${numPorts})`}
              data={ports}
              columns={this.portCols}
              singleSelect
              select={this.state.id}
              onSelectChange={this._onSelect}
              onEdit={this._onEditOpen}
          />
        </ResponsiveBox>
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

export default connect(select)(VlanPage2);
