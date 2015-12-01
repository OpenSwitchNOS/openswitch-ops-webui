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
import DataGrid from 'dataGrid.jsx';
import BoxContainer from 'boxContainer.jsx';
import FetchInfo from 'fetchInfo.jsx';

class VlanRouteContainer extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    vlan: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.props.actions.vlan.fetchIfNeeded();
  }

  render() {
    const vlanProps = this.props.vlan;
    const cols = [
      {
        columnKey: 'id',
        header: t('id'),
        flexGrow: 1,
        width: 200,
        align: 'right',
      },
      {
        columnKey: 'name',
        header: t('name'),
        flexGrow: 2,
        width: 200,
        align: 'center',
      },
    ];

    return (
      <BoxContainer page col pad2x>
        <BoxContainer panel pad marginBottom2x>
          <FetchInfo {...vlanProps}/>
        </BoxContainer>
        <BoxContainer panel pad computeSize flex={1}>
          <DataGrid title={t('vlans')} width={500} height={400}
              data={vlanProps.entities}
              columns={cols}
          />
        </BoxContainer>
      </BoxContainer>
    );
  }

}

function select(state) {
  return {
    vlan: state.vlan,
  };
}

export default connect(select)(VlanRouteContainer);
