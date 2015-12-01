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
import DataGrid, { CustomCell } from 'dataGrid.jsx';
import BoxContainer from 'boxContainer.jsx';
import FetchInfo from 'fetchInfo.jsx';

class ReferenceDataGridRouteContainer extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    reference: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.props.actions.reference.fetchIfNeeded();
  }

  customCell = (cellData, cellProps, colProps) => {
    return (
      <CustomCell {...cellProps}>
        {cellData}
        <i>{
          ` (rowIndex: ${cellProps.rowIndex}, columnKey: ${colProps.columnKey})`
        }</i>
      </CustomCell>
    );
  }

  onEdit = (selection) => {
    alert(selection);
  }

  render() {
    const refProps = this.props.reference;
    const cols = [
      {
        columnKey: 'id',
        header: t('id'),
        width: 200,
        align: 'center',
        flexGrow: 1,
        cell: this.customCell,
      },
      {
        columnKey: 'text',
        header: t('text'),
        width: 200,
        flexGrow: 1
      },
    ];

    return (
      <BoxContainer page col pad2x>
        <BoxContainer panel marginBottom2x pad>
          <h3>Example DataGrid</h3>
          resposive, data fetch, column sort, column align, filter, row select,
          custom cell render
        </BoxContainer>
        <BoxContainer panel marginBottom2x pad>
          <FetchInfo {...refProps}/>
        </BoxContainer>
        <BoxContainer panel pad computeSize flex={1}>
          <DataGrid title={t('reference')} width={500} height={400}
              data={refProps.entities}
              columns={cols}
              onEdit={this.onEdit}
          />
        </BoxContainer>
      </BoxContainer>
    );
  }

}

function select(state) {
  return {
    reference: state.reference,
  };
}

export default connect(select)(ReferenceDataGridRouteContainer);
