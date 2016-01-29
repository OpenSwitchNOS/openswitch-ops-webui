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
import ReactCSSTG from 'react-addons-css-transition-group';
import { connect } from 'react-redux';
import { t } from 'i18n/lookup.js';
import Box from 'grommet/components/Box';
import ResponsiveBox from 'responsiveBox.jsx';
import DataGrid from 'dataGrid.jsx';


class VlanPage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    children: PropTypes.node,
    history: PropTypes.object.isRequired,
    params: PropTypes.shape({
      id: PropTypes.string
    }),
    vlan: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.cols = [
      {
        columnKey: 'id',
        header: t('id'),
        width: 100,
        align: 'right',
      },
      {
        columnKey: 'name',
        header: t('name'),
        flexGrow: 1,
        width: 200,
      },
    ];
    this.state = {};
  }

  componentDidMount() {
    this.props.actions.vlan.fetch();
    this.props.actions.toolbar.setFetchTB(this.props.vlan, this._onRefresh);
  }

  _onRefresh = () => {
    this.props.actions.vlan.fetch();
  };

  componentWillReceiveProps(nextProps) {
    this.props.actions.toolbar.setFetchTB(nextProps.vlan, this._onRefresh);
  }

  componentWillUnmount() {
    this.props.actions.toolbar.clear();
  }

  _onSelect = (id) => {
    this.props.history.pushState(null, `/vlan/${id}`);
  };

  render() {
    const vlans = this.props.vlan.entities;

    // TODO: On small screens the layer is not overlayed so not model, need a way to keep the layer on small screens (i.e. disable the page)
    // TODO: Grommet has a display: none for + 'app' classes but the toplevel page is not a sibling of the layer
    const details = !this.props.params.id ? null : (
        <Box className="pageBox">
          <ReactCSSTG
              transitionName="slideInColumn"
              transitionAppear
              transitionAppearTimeout={500}
              transitionEnterTimeout={500}
              transitionLeaveTimeout={500}>
            {this.props.children}
          </ReactCSSTG>
        </Box>
    );

    return (
      <Box direction="row" className="flex1">
        <Box className="flex1">
          <Box className="pageBox min200x200">
            ...BoxGraphic goes here...
          </Box>
          <Box className="flex1 mTopHalf mLeft">
            <ResponsiveBox>
              <DataGrid width={300} height={400}
                  data={vlans}
                  columns={this.cols}
                  singleSelect
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
    vlan: store.vlan,
  };
}

export default connect(select)(VlanPage);
