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
import { t } from 'i18n/lookup.js';
import Header from 'grommet/components/Header';
// import Footer from 'grommet/components/Footer';
// import Menu from 'grommet/components/Menu';
import Title from 'grommet/components/Title';
import Box from 'grommet/components/Box';
import Layer from 'grommet/components/Layer';
// import Form from 'grommet/components/Form';
// import FormField from 'grommet/components/FormField';
// import FormFields from 'grommet/components/FormFields';
// import Button from 'grommet/components/Button';
import _ from 'lodash';
// import DataGrid from 'dataGrid.jsx';
// import { MultiRange as Range } from 'multi-integer-range';


class VlanEdit extends Component {

  static propTypes = {
    data: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired,
    vlanId: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.pad = {horizontal: 'small', vertical: 'small'};
    this.fid = _.uniqueId('vlanAdd_');
    this.vlanCols = [
      {
        columnKey: 'id',
        header: t('id'),
        width: 100,
        align: 'right',
      },
      {
        columnKey: 'name',
        header: t('name'),
        width: 200,
      },
    ];
    this.state = {};
  }

  _isDirty = () => {
    return !_.isEqual(this.state, {});
  };

  _isValid = () => {
    // range.subtract(Object.keys(this.props.vlans).map( k => Number(k) ));
    // return this.state.id && range.has(this.state.id);
  };

  _onOk = () => {
    this.props.onOk(this.state);
  };

  _id = s => `${this.fid}_${s}`;

  render() {
    // TOOD: Move to BL.
    // const range = new Range('1-2048');
    // range.subtract(Object.keys(this.props.vlans).map( k => Number(k) ));
    // const isValid = this._isValid(range);
    // const err = isValid || !this.state.id ? null : t('invalid');
    // const allowSet = this._isDirty() && isValid;

    return (
      <Layer
          className="edit"
          onClose={this.props.onClose}
          closer
          flush
          align="right">
        <Box pad="small" className="flex1">
          <Header tag="h4" justify="between" pad={{horizontal: 'medium'}}>
            <Title>
            {`${t('edit')} ${t('vlan')}: ${this.props.vlanId}`}
            </Title>
          </Header>
          <hr/>
        </Box>
      </Layer>
    );
  }
}

export default VlanEdit;
