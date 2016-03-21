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
import ReactCSSTG from 'react-addons-css-transition-group';
import LagEdit from './lagEdit.jsx';
import LagCreation from './lagCreation.jsx';
import ErrorLayer from 'errorLayer.jsx';

class LagPage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    autoActions: PropTypes.object.isRequired,
    children: PropTypes.node,
    collector: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    lag: PropTypes.object.isRequired,
    params: PropTypes.shape({
      id: PropTypes.string
    }),
  };

  constructor(props) {
    super(props);
    this.lagCols = [
      {
        columnKey: 'idModified',
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
        columnKey: 'status',
        header: t('status'),
        width: 140,
      },
      {
        columnKey: 'vlanMode',
        header: t('vlanMode'),
        width: 200,
      },
      {
        columnKey: 'lagInterfaces',
        header: t('interfaces'),
        cell: this._onCustomCell,
        flexGrow: 1,
        width: 150,
        minWidth: 100,
        maxWidth: 200,
        allowCellsRecycling: true,
      },
      {
        columnKey: 'vlans',
        header: t('vlan'),
        cell: this._onCustomCell,
        flexGrow: 1,
        width: 140,
      },
    ];
    this.state = {
      id: null,
      edit: false,
      newLag: false,
      deleteLag: false,
    };
  }


_onCustomCell = (cellData, cellProps) => {
  const ids = Object.keys(cellData).sort().join(', ');
  return (
    <CustomCell {...cellProps}>
      {ids}
    </CustomCell>
  );
};


componentDidMount() {
  this.props.autoActions.collector.fetch();
  this.props.actions.lag.fetch();
}

_onRefresh = () => {
  this.props.autoActions.collector.fetch();
};

 _onSelect = (sel) => {
   this.setState({ id: sel });
   const url = sel ? `/lag/${sel}` : '/lag';
   this.props.history.pushState(null, url);
 };

_onEdit = () => {
  const edit = !this.state.edit;
  this.setState({edit});
};

_onEditSubmit = (lag) => {
  this.props.actions.lag.addLag(lag);
  this._onCreateNewLag();
};

_onSubmitLagEdit = () => {
  this._onEdit();
};

_tr = (td1, td2) => {
  return (
    <tr>
      <td style={{width: 200}}>{td1}:</td>
      <td style={{width: 200}}>{td2}</td>
    </tr>
  );
};

_onCreateNewLag = () => {
  const newLag = !this.state.newLag;
  this.setState({newLag});
};

_onClose = () => {
  this.setState({newLag: false});
};

_onDeleteLagToggle = () => {
  const deleteLag = !this.state.deleteLag;
  this.setState({deleteLag});
};

_onDeleteLag = (sel) => {
  const lagInterfacesToBeRemoved = this.props.lag.page.lags[sel].lagInterfaces;
  this.props.actions.lag.deletingLag(sel, lagInterfacesToBeRemoved);
  this._onDeleteLagToggle();
};

_onCloseError = () => {
  this.props.actions.lag.clearErrorForSet();
};


render() {
  const lags = this.props.lag.page.lags;

  // TODO: put this in the collector so we have it for the overview?
  const numLags = Object.getOwnPropertyNames(lags).length;
  //const sel = this.props.params.id;
  const set = this.props.lag.set;
  const errorLayer = !set.lastError ? null :
    <ErrorLayer error={set.lastError} onClose={this._onCloseError} />;

  const editLayer = !this.state.edit || !this.state.id ? null :
    <LagEdit
        actions={this.props.actions}
        onClose={this._onEdit}
        onSubmit={this._onSubmitLagEdit}
        params={this.props.params}
      />;
  // TODO: This check is not needed - see the vlan page
  const details = !this.state.id ? null : (
    <Box className="pageBox">
      <ReactCSSTG
          transitionName="slideInColumn"
          transitionAppear
          transitionAppearTimeout={500}
          transitionEnterTimeout={500}
          transitionLeaveTimeout={500}>
        <div>
          {this.props.children}
        </div>
      </ReactCSSTG>
    </Box>
  );
  const addLag = this.state.newLag ?
    <LagCreation
        onClose={this._onCreateNewLag}
        onSubmit={this._onEditSubmit}
    /> : null;

  const deleteLag = this.state.deleteLag ?
    this._onDeleteLag(this.state.id) : null;

  return (
    <Box className="flex1 mTopHalf mLeft" direction="row">
      <ResponsiveBox>
        <DataGrid width={400} height={400}
            title={`(${numLags})`}
            data={lags}
            columns={this.lagCols}
            singleSelect
            onSelectChange={this._onSelect}
            select={this.state.id}
            onEdit={this._onEdit}
            onAdd={this._onCreateNewLag}
            onDelete={this._onDeleteLagToggle}
            style={{overflow: 'visible'}}
        />
      </ResponsiveBox>
      {editLayer}
      {addLag}
      {deleteLag}
      {details}
      {errorLayer}
    </Box>
  );
}

}

function select(store) {
  return {
    collector: store.collector,
    lag: store.lag,
  };
}

export default connect(select)(LagPage);
