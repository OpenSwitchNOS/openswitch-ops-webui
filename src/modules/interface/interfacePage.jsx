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
import Box from 'grommet/components/Box';
import ResponsiveBox from 'responsiveBox.jsx';
import DataGrid from 'dataGrid.jsx';
import BoxGraphic from 'boxGraphics/boxGraphic.jsx';

// TODO: On small screens the layer is not overlayed so not model, need a way to keep the layer on small screens (i.e. disable the page)
// TODO: Grommet has a display: none for + 'app' classes but the toplevel page is not a sibling of the layer


class InterfacePage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    autoActions: PropTypes.object.isRequired,
    boxGraphic: PropTypes.object.isRequired,
    children: PropTypes.node,
    collector: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    interface: PropTypes.object.isRequired,
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
        align: 'left',
      },
      {
        columnKey: 'userCfgAdmin',
        header: t('userCfgAdmin'),
        width: 215,
        format: ud,
      },
      {
        columnKey: 'adminStateConnector',
        header: t('adminState'),
        width: 215,
        format: t,
      },
      {
        columnKey: 'linkState',
        header: t('linkState'),
        width: 215,
        format: t,
      },
      {
        columnKey: 'duplex',
        header: t('duplex'),
        width: 215,
        format: t,
      },
      {
        columnKey: 'speedFormatted',
        header: t('speed'),
        width: 215,
      },
      {
        columnKey: 'connector',
        header: t('connector'),
        width: 215,
      },
    ];
    this.state = {};
  }

  componentDidMount() {
    this.props.actions.toolbar.setFetchTB(
      this.props.collector.overview, this._onRefresh
    );
  }

  _onRefresh = () => {
    this.props.autoActions.collector.fetch();
  };

  componentWillReceiveProps(nextProps) {
    this.props.actions.toolbar.setFetchTB(
      nextProps.collector.overview, this._onRefresh
    );
  }

  componentWillUnmount() {
    this.props.actions.toolbar.clear();
  }

  _onSelect = (id) => {
    this.props.history.pushState(null, `/interface/${id}`);
  };

  render() {
    const infs = this.props.collector.overview.interfaces;
    const sel = this.props.params.id;

    const details = !sel ? null : (
      <Box className="pageBox">
        {this.props.children}
      </Box>
    );

    return (
      <Box direction="row" className="flex1">
        <Box className="flex1">
          <Box className="mtop mLeft pTop">
            <BoxGraphic
                spec={this.props.boxGraphic}
                interfaces={infs}
                select={sel && [sel]}
                onSelectChange={this._onSelect}
            />
          </Box>
          <Box className="flex1 mTopHalf mLeft">
            <ResponsiveBox>
              <DataGrid width={300} height={400}
                  data={infs}
                  columns={this.cols}
                  singleSelect
                  select={[ sel ]}
                  onSelectChange={this._onSelect}
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
    collector: store.collector,
    interface: store.interface,
    boxGraphic: store.boxGraphic,
  };
}

export default connect(select)(InterfacePage);
