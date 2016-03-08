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
import DataGrid from 'dataGrid.jsx';


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
    this.vlanCols = [
      {
        columnKey: 'id',
        header: t('id'),
        width: 150,
        align: 'right',
      },
      {
        columnKey: 'tag',
        header: t('tag'),
        width: 200,
      },
      {
        columnKey: 'trunks',
        header: t('trunks'),
        width: 140,
      },
      {
        columnKey: 'mode',
        header: t('vlanMode'),
        width: 200,
      },
    ];
    this.state = {};
  }

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
    this.props.actions.toolbar.setFetchTB(
      nextProps.vlan.page,
      this._onRefresh
    );
  }

  componentWillUnmount() {
    this.props.actions.toolbar.clear();
  }

  _onEdit = (sel) => {
    alert(`Edit: ${sel}`);
  };

  render() {
    const vlans = this.props.vlan.page.vlans2;

    // TODO: put this in the collector so we have it for the overview?
    const numVlans = Object.getOwnPropertyNames(vlans).length;

    return (
      <Box className="flex1 mTopHalf mLeft">
        <ResponsiveBox>
          <DataGrid width={200} height={400}
              title={`(${numVlans})`}
              data={vlans}
              columns={this.vlanCols}
              singleSelect
              select={[ this.props.params.id ]}
              onEdit={this._onEdit}
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
