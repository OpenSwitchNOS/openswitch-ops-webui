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

class InterfaceRouteContainer extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    interface: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.props.actions.interface.fetchIfNeeded();
  }

  render() {
    const infProps = this.props.interface;
    const cols = [
      {
        columnKey: 'name',
        header: t('name'),
        flexGrow: 2,
        width: 300,
        align: 'left'
      },
      {
        columnKey: 'adminState',
        header: t('state'),
        flexGrow: 1,
        width: 200,
        align: 'right'
      },
    ];

    return (
      <BoxContainer page col pad2x>
        <BoxContainer panel pad marginBottom2x>
          <FetchInfo {...infProps}/>
        </BoxContainer>
        <BoxContainer panel pad computeSize flex={1}>
          <DataGrid title={t('interfaces')} width={500} height={400}
              data={infProps.entities}
              columns={cols}
          />
        </BoxContainer>
      </BoxContainer>
    );
  }

}

function select(state) {
  return {
    interface: state.interface,
  };
}

export default connect(select)(InterfaceRouteContainer);
