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
import Button from 'grommet/components/Button';

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
        columnKey: 'interfaces',
        header: t('interfaces'),
        width: 140,
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

componentWillReceiveProps(nextProps) {
  this.props.actions.toolbar.setFetchTB(nextProps.collector, this._onRefresh);
}

componentWillUnmount() {
  this.props.actions.toolbar.clear();
}

 _onSelect = (sel) => {
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

_onSubmitLagEdit = (lag, lagPorts, lagId, lagInterfacesToRemove) => {
  if (Object.getOwnPropertyNames(lagInterfacesToRemove).length > 0 ) {
    this.props.actions.lag.removeInterfaceFromLag(lagInterfacesToRemove);
  }
  this.props.actions.lag.editLag(lag, lagPorts, lagId, lagInterfacesToRemove);
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
  this.props.actions.lag.deletingLag(sel, this.props.lag.page.lags[sel].lagInterfaces);
  this._onDeleteLagToggle();
};

render() {
  const lags = this.props.lag.page.lags;

  // TODO: put this in the collector so we have it for the overview?
  const numLags = Object.getOwnPropertyNames(lags).length;
  const sel = this.props.params.id;
  const edit = !this.state.edit ? null :
    <LagEdit
        lag={lags}
        onClose={this._onEdit}
        onSubmit={this._onSubmitLagEdit}
        params={this.props.params}
      />;
  // TODO: This check is not needed - see the vlan page
  const details = !sel ? null : (
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

  return (
    <Box className="flex1 mTopHalf mLeft" direction="row">

      <ResponsiveBox>
        <DataGrid width={400} height={400}
            title={`(${numLags})`}
            data={lags}
            columns={this.lagCols}
            singleSelect
            onSelectChange={this._onSelect}
            select={[ sel ]}
            onEdit={this._onEdit}
        />
      </ResponsiveBox>
      {details}
      {edit}
      <center>
        <Button label="Create New LAG" primary onClick={this._onCreateNewLag}/>
      </center>
      { //TODO: Should be localized
        this.state.newLag ?
        <LagCreation
            onClose={this._onCreateNewLag}
            onSubmit={this._onEditSubmit}
        /> : null
    }
    <br/>
    <center>
      <Button label="Delete LAG" primary onClick={this._onDeleteLagToggle}/>
      {
        this.state.deleteLag ? this._onDeleteLag(sel) : null
      }

    </center>
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
