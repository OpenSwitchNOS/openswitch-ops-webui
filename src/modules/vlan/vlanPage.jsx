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
import VlanAdd from './vlanAdd.jsx';
import ErrorLayer from 'errorLayer.jsx';


class VlanPage extends Component {

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
    this.vlanCols = [
      {
        columnKey: 'id',
        header: t('id'),
        width: 100,
        align: 'right',
      },
      {
        columnKey: 'name',
        header: t('name'),
        width: 200,
      },
      {
        columnKey: 'operState',
        header: t('status'),
        width: 140,
      },
      {
        columnKey: 'operStateReason',
        header: t('reason'),
        width: 140,
      },
      {
        columnKey: 'interfaces',
        header: t('interfaces'),
        cell: this._onCustomCell,
        flexGrow: 1,
        width: 140,
      },
    ];
    this.state = {
      addMode: false,
    };
  }

  _onCustomCell = (cellData, cellProps) => {
    // TOOD: this should be moved into Utils.
    const idKeys = [];
    const lagKeys = [];
    Object.keys(cellData).forEach( k => {
      if (isNaN(k)) {
        lagKeys.push(k);
      } else {
        idKeys.push(Number(k));
      }
    });
    const lagStr = lagKeys.length === 0 ? '' : `, ${lagKeys.sort().join(', ')}`;
    const idStr = new Range(idKeys).toString().split(',').join(', ');
    return (
      <CustomCell {...cellProps}>
        {`${idStr}${lagStr}`}
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

    // TODO: should we check an nop if the vlan.page is already the toolbar?
    this.props.actions.toolbar.setFetchTB(
      nextProps.vlan.page,
      this._onRefresh
    );
  }

  componentWillUnmount() {
    this.props.actions.toolbar.clear();
  }

  _onSelect = (sel) => {
    const url = sel ? `/vlan/${sel}` : '/vlan';
    this.props.history.pushState(null, url);
  };

  _onEdit = (sel) => {
    alert(`Edit: ${sel}`);
  };

  _onAddOpen = () => {
    this.setState({ addMode: true });
  };

  _onAddApply = (cfg) => {
    // TODO: Need to standardize the data and new cfg to set methods...see interface Dux.
    this.props.actions.vlan.addVlan(this.props.vlan.page, cfg);
  };

  _onAddOk = (data) => {
    this._onAddApply(data);
    this.setState({ addMode: false });
  };

  _onAddClose = () => {
    this.setState({ addMode: false });
  };

  _onDelete = (sel) => {
    alert(`Delete: ${sel}`);
  };

  _onCloseError = () => {
    this.props.actions.vlan.clearErrorForSet();
  };

  render() {
    const vlans = this.props.vlan.page.vlans;

    // TODO: put this in the collector so we have it for the overview?
    const numVlans = Object.getOwnPropertyNames(vlans).length;

    const addLayer = !this.state.addMode ? null :
      <VlanAdd
          onClose={this._onAddClose}
          onOk={this._onAddOk}
          onApply={this._onAddApply}
          vlans={vlans}
      />;

    const set = this.props.vlan.set;
    const errorLayer = !set.lastError ? null :
      <ErrorLayer error={set.lastError} onClose={this._onCloseError} />;

    return (
      <Box className="flex1 mTopHalf mLeft">
        {addLayer}
        {errorLayer}
        <ResponsiveBox>
          <DataGrid width={400} height={400}
              title={`(${t('count')}: ${numVlans})`}
              data={vlans}
              columns={this.vlanCols}
              singleSelect
              onSelectChange={this._onSelect}
              select={[ this.props.params.id ]}
              onEdit={this._onEdit}
              onAdd={this._onAddOpen}
              onDelete={this._onDelete}
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

export default connect(select)(VlanPage);
