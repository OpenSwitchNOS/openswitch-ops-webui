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
import CheckBox from 'grommet/components/CheckBox';
import ResponsiveBox from 'responsiveBox.jsx';
import DataGrid, { CustomCell } from 'dataGrid.jsx';
import { mkStatusLayer } from 'asyncStatusLayer.jsx';
import { naturalSort } from 'sorts.js';
import DetailsBox from 'detailsBox.jsx';
import ConfirmLayer from 'confirmLayer.jsx';
import LagEdit from './lagEdit.jsx';
import LagAdd from './lagAdd.jsx';


class LagPage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    children: PropTypes.node,
    history: PropTypes.object.isRequired,
    lag: PropTypes.object.isRequired,
    params: PropTypes.shape({
      id: PropTypes.string
    }),
  };

  constructor(props) {
    super(props);
    this.cols = [
      {
        columnKey: 'id',
        header: t('id'),
        width: 80,
        align: 'right',
      },
      {
        columnKey: 'name',
        header: t('name'),
        width: 120,
      },
      {
        columnKey: 'bondStatus',
        header: t('status'),
        width: 140,
        format: t,
      },
      {
        columnKey: 'interfaces',
        header: t('interfaces'),
        cell: this._onCustomCell,
        flexGrow: 1,
        width: 150,
      },
      {
        columnKey: 'vlanMode',
        header: t('vlanMode'),
        width: 200,
      },
      {
        columnKey: 'vlanIds',
        header: t('vlans'),
        flexGrow: 1,
        width: 150,
        format: arr => arr.sort(naturalSort).join(', '),
      },
    ];
    this.state = {
      showDetailsOnSelect: true,
    };
  }

  _onCustomCell = (cellData, cellProps) => {
    const ids = Object.keys(cellData).sort(naturalSort).join(', ');
    return (
      <CustomCell {...cellProps}>
        {ids}
      </CustomCell>
    );
  };

  componentDidMount() {
    const p = this.props;
    p.actions.lag.fetchPage();
    p.actions.toolbar.setFetchTB(p.lag.asyncStatus, this._onRefresh);
  }

  _onRefresh = () => {
    this.props.actions.lag.fetchPage();
  };

  componentWillReceiveProps(nextProps) {
    const p = nextProps;
    p.actions.toolbar.setFetchTB(p.lag.asyncStatus, this._onRefresh);
  }

  componentWillUnmount() {
    this.props.actions.toolbar.clear();
  }

   _onSelect = (sel) => {
     const url = sel ? `/lag/${sel}` : '/lag';
     this.props.history.pushState(null, url);
   };

  _onDelete = () => {
    const lagId = this.props.params.id;
    const infs = this.props.lag.lags[lagId].interfaces;
    this.props.actions.lag.deleteLag(lagId, infs);
    this.setState({ deleteLagLayer: false });
  };

  _onShowDetailsOnSelect = (evt) => {
    this.setState({ showDetailsOnSelect: evt.target.checked });
  };

  render() {
    const lags = this.props.lag.lags;
    const numLags = Object.getOwnPropertyNames(lags).length;
    const selLagId = this.props.params.id;

    const statusLayer = mkStatusLayer(
          this.props.lag.asyncStatus,
          this.props.actions.lag.clearError);

    const details = !selLagId || !this.state.showDetailsOnSelect ? null : (
      <DetailsBox>
        {this.props.children}
      </DetailsBox>
    );

    const addLagLayer = !this.state.addLagLayer ? null :
      <LagAdd
          actions={this.props.actions}
          onClose={() => this.setState({addLagLayer: false})}
      />;

    const editLagLayer = !selLagId || !this.state.editLagLayer ? null :
      <LagEdit
          actions={this.props.actions}
          lagId={selLagId}
          onClose={() => this.setState({editLagLayer: false})}
      />;

    const deleteLagLayer = !this.state.deleteLagLayer ? null :
      <ConfirmLayer
          title={`${t('deleteLag')} ${selLagId}`}
          onClose={() => this.setState({deleteLagLayer: false})}
          onSubmit={this._onDelete}
          submitLabel={t('yes')}>
        {t('areYouSureDeleteLag')}
      </ConfirmLayer>;

    return (
      <Box className="flex1" direction="row">
        {statusLayer}
        {addLagLayer}
        {editLagLayer}
        {deleteLagLayer}
        <Box className="flex1 mTop mLeft">
          <ResponsiveBox>
            <DataGrid width={400} height={400}
                title={`${t('total')}: ${numLags}`}
                data={lags}
                columns={this.cols}
                singleSelect
                select={selLagId}
                onSelectChange={this._onSelect}
                onAdd={() => this.setState({addLagLayer: true})}
                onDelete={() => this.setState({deleteLagLayer: true})}
                onEdit={() => this.setState({editLagLayer: true})}
                toolbar={[
                  <CheckBox
                      onChange={this._onShowDetailsOnSelect}
                      checked={this.state.showDetailsOnSelect}
                      key="lagDetCb"
                      id="lagDetCb"
                      name="lagDetCb"
                      label={t('details')}
                      />,
                ]}
            />
          </ResponsiveBox>
        </Box>
        {details}
      </Box>
    );
  }

}

function select(store) {
  return {
    lag: store.lag,
  };
}

export default connect(select)(LagPage);
