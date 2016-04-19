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
import { t, tOrKey } from 'i18n/lookup.js';
import Box from 'grommet/components/Box';
import ResponsiveBox from 'responsiveBox.jsx';
import DataGrid from 'dataGrid.jsx';
import BoxGraphic from 'boxGraphics/boxGraphic.jsx';
import CheckBox from 'grommet/components/CheckBox';
import { mkStatusLayer } from 'asyncStatusLayer.jsx';
import InterfaceEdit from './interfaceEdit.jsx';
import DetailsBox from 'detailsBox.jsx';
import Formatter from 'formatter.js';


class InterfacePage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    children: PropTypes.node,
    collector: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    interface: PropTypes.object.isRequired,
    params: PropTypes.shape({
      id: PropTypes.string
    }),
    settings: PropTypes.shape({
      boxGraphics: PropTypes.array.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.cols = [
      {
        columnKey: 'id',
        header: t('id'),
        width: 80,
        align: 'left',
      },
      {
        columnKey: 'cfgAdmin',
        header: t('configured'),
        width: 150,
        format: t
      },
      {
        columnKey: 'adminStateConnector',
        header: t('adminState'),
        width: 160,
        format: t
      },
      {
        columnKey: 'linkState',
        header: t('linkState'),
        width: 150,
        format: t
      },
      {
        columnKey: 'connector',
        header: t('connector'),
        width: 150,
        format: tOrKey
      },
      {
        columnKey: 'duplex',
        header: t('duplex'),
        width: 120,
        format: t,
      },
      {
        columnKey: 'speed',
        header: t('speed'),
        width: 120,
        format: Formatter.bpsToString,
      },
      {
        columnKey: 'canSplit',
        header: t('canSplit'),
        width: 120,
        format: t,
      },
    ];
    this.state = {
      showDetailsOnSelect: true,
    };
  }

  componentDidMount() {
    const p = this.props;
    p.actions.interface.fetchPage();
    p.actions.toolbar.setFetchTB(p.interface.asyncStatus, this._onRefresh);
  }

  _onRefresh = () => {
    this.props.actions.interface.fetchPage();
  };

  componentWillReceiveProps(nextProps) {
    const p = nextProps;
    p.actions.toolbar.setFetchTB(p.interface.asyncStatus, this._onRefresh);
  }

  componentWillUnmount() {
    this.props.actions.toolbar.clear();
  }

  _onSelect = (sel) => {
    const url = sel ? `/interface/${sel}` : '/interface';
    this.props.history.pushState(null, url);
  };

  _onShowDetailsOnSelect = (evt) => {
    this.setState({ showDetailsOnSelect: evt.target.checked });
  };

  _mkBoxGraphic = () => {
    let boxGraphic = null;
    const bgs = this.props.settings.boxGraphics;
    for (let i=0; i<bgs.length; i++) {
      if (bgs[i].supportsPlatform(this.props.collector.platform)) {
        boxGraphic = (
          <BoxGraphic
              spec={bgs[i]}
              interfaces={this.props.interface.interfaces}
              select={this.props.params.id}
              onSelectChange={this._onSelect}
          />
        );
      }
    }
    return boxGraphic;
  };

  render() {
    const selInfId = this.props.params.id;
    const showOnSel = this.state.showDetailsOnSelect;

    const editLayer = !this.state.editMode ? null :
      <InterfaceEdit
          actions={this.props.actions}
          infId={selInfId}
          onClose={() => this.setState({editMode: false})}
      />;

    const details = !selInfId || !showOnSel ? null : (
      <DetailsBox>
        {this.props.children}
      </DetailsBox>
    );

    const statusLayer = mkStatusLayer(
          this.props.interface.asyncStatus,
          this.props.actions.interface.clearError);

    const infs = this.props.interface.interfaces;
    const numInfs = Object.getOwnPropertyNames(infs).length;

    return (
      <Box direction="row" className="flex1">
        {statusLayer}
        {editLayer}
        <Box className="flex1">
          <Box className="mTop mLeft">
            {this._mkBoxGraphic()}
          </Box>
          <Box className="flex1 mTopHalf mLeft">
            <ResponsiveBox>
              <DataGrid width={300} height={400}
                  title={`${t('total')}: ${numInfs}`}
                  data={infs}
                  columns={this.cols}
                  singleSelect
                  select={selInfId}
                  onSelectChange={this._onSelect}
                  onEdit={() => this.setState({editMode: true})}
                  toolbar={[
                    <CheckBox
                        onChange={this._onShowDetailsOnSelect}
                        checked={this.state.showDetailsOnSelect}
                        key="infDetCb"
                        id="infDetCb"
                        name="infDetCb"
                        label={t('details')}/>
                  ]}
              />
            </ResponsiveBox>
          </Box>
        </Box>
        {details}
      </Box>
    );
  }

}

function select(store) {
  return {
    interface: store.interface,
    collector: store.collector,
    settings: store.settings,
  };
}

export default connect(select)(InterfacePage);
