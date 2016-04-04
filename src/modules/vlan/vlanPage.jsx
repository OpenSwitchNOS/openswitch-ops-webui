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
import Range from 'range.js';
// import VlanAdd from './vlanAdd.jsx';
import { mkStatusLayer } from 'asyncStatusLayer.jsx';


// TODO: Needs to be refactored when we actually can configure VLANs.

class VlanPage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    autoActions: PropTypes.object.isRequired,
    children: PropTypes.node,
    history: PropTypes.object.isRequired,
    params: PropTypes.shape({
      id: PropTypes.string
    }),
    vlan: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.byVlanCols = [
      {
        columnKey: 'id',
        header: t('vlanId'),
        width: 130,
      },
      {
        columnKey: 'name',
        header: t('vlanName'),
        width: 200,
      },
      {
        columnKey: 'operState',
        header: t('status'),
        width: 140,
        format: t,
      },
      {
        columnKey: 'operStateReason',
        header: t('reason'),
        width: 140,
        format: t,
      },
      {
        columnKey: 'interfaces',
        header: t('interfaces'),
        cell: this._onInterfacesCell,
        flexGrow: 1,
        width: 140,
      },
    ];
    this.byInterfaceCols = [
      {
        columnKey: 'id',
        header: t('interface'),
        width: 130,
      },
      {
        columnKey: 'mode',
        header: t('vlanMode'),
        width: 160,
        format: t,
      },
      {
        columnKey: 'tag',
        header: t('tag'),
        width: 100,
      },
      {
        columnKey: 'trunks',
        header: t('trunks'),
        width: 200,
        cell: this._onTrunksCell,
        flexGrow: 1,
      },
    ];
    this.state = {};
  }

  _onInterfacesCell = (cellData, cellProps) => {
    // TOOD: this should be moved into Utils.
    const idKeys = [];
    const lagKeys = [];
    let lagStr = '';
    let idStr = '';
    Object.keys(cellData).forEach( k => {
      if (isNaN(k)) {
        lagKeys.push(k);
      } else {
        idKeys.push(Number(k));
      }
    });
    if (idKeys.length > 0) {
      idStr = new Range(idKeys).toString().split(',').join(', ');
      lagStr = lagKeys.length === 0 ? '' : `, ${lagKeys.sort().join(', ')}`;
    } else {
      lagStr = lagKeys.length === 0 ? '' : `${lagKeys.sort().join(', ')}`;
    }
    return (
      <CustomCell {...cellProps}>
        {`${idStr}${lagStr}`}
      </CustomCell>
    );
  };

  // _onTrunksCell = (cellData, cellProps) => {
  //   // TOOD: this should be moved into Utils.
  //   // const idKeys = [];
  //   // const lagKeys = [];
  //   // Object.keys(cellData).forEach( k => {
  //   //   if (isNaN(k)) {
  //   //     lagKeys.push(k);
  //   //   } else {
  //   //     idKeys.push(Number(k));
  //   //   }
  //   // });
  //   // const lagStr = lagKeys.length === 0 ? '' : `, ${lagKeys.sort().join(', ')}`;
  //   // const idStr = new Range(idKeys).toString().split(',').join(', ');
  //   return (
  //     <CustomCell {...cellProps}>
  //       {cellData}
  //     </CustomCell>
  //   );
  // };

  componentDidMount() {
    const p = this.props;
    p.actions.vlan.fetch();
    p.actions.toolbar.setFetchTB(p.vlan.asyncStatus, this._onRefresh);
  }

  _onRefresh = () => {
    this.props.actions.vlan.fetch();
  };

  componentWillReceiveProps(nextProps) {
    const p = nextProps;
    p.actions.toolbar.setFetchTB(p.vlan.asyncStatus, this._onRefresh);
  }

  componentWillUnmount() {
    this.props.actions.toolbar.clear();
  }

  // _onSelect = (sel) => {
  //   const url = sel ? `/vlan/${sel}` : '/vlan';
  //   this.props.history.pushState(null, url);
  // };
  //
  // _onAddOpen = () => {
  //   this.setState({ addMode: true });
  // };
  //
  // _onAddApply = (cfg) => {
  //   // TODO: Need to standardize the data and new cfg to set methods...see interface Dux.
  //   this.props.actions.vlan.addVlan(this.props.vlan, cfg);
  // };
  //
  // _onAddOk = (data) => {
  //   this._onAddApply(data);
  //   this.setState({ addMode: false });
  // };
  //
  // _onAddClose = () => {
  //   this.setState({ addMode: false });
  // };

  render() {
    const data = this.props.vlan;

    const numVlans = Object.getOwnPropertyNames(data.vlans).length;
    // const numInterfaces = Object.getOwnPropertyNames(data.interfaces).length;

    // const addVlanLayer = !this.state.addVlanLayer ? null :
    //   <VlanAdd
    //       actions={this.props.actions}
    //       onClose={() => this.setState({addVlanLayer: false})}
    //   />;

    const statusLayer = mkStatusLayer(
          data.asyncStatus,
          this.props.actions.vlan.clearError);

    // onAdd={() => this.setState({addVlanLayer: true})}

    return (
      <Box className="flex1 mTop mLeft">
        {/*{addVlanLayer}*/}
        {statusLayer}
        <ResponsiveBox>
          <DataGrid width={400} height={400}
              title={`${t('total')}: ${numVlans}`}
              data={data.vlans}
              columns={this.byVlanCols}
              noSelect
              onSelectChange={this._onSelect}
              select={this.props.params.id}
          />
        </ResponsiveBox>
        {/*<br/>
        <ResponsiveBox>
          <DataGrid width={400} height={400}
              title={`${t('totalInterfaces')}: ${numInterfaces}`}
              columns={this.byInterfaceCols}
              data={data.interfaces}
          />
        </ResponsiveBox>*/}
      </Box>
    );
  }

}

function select(store) {
  return {
    vlan: store.vlan,
  };
}

export default connect(select)(VlanPage);
