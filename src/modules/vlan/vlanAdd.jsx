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
import Footer from 'grommet/components/Footer';
import Menu from 'grommet/components/Menu';
import Title from 'grommet/components/Title';
import Box from 'grommet/components/Box';
import Layer from 'grommet/components/Layer';
import NumberInput from 'grommet/components/NumberInput';
import Button from 'grommet/components/Button';
import DataGrid from 'dataGrid.jsx';
import Range from 'range.js';
import _ from 'lodash';


class VlanAdd extends Component {

  // TODO: vlan should be called data or something
  static propTypes = {
    actions: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    vlan: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.fid = _.uniqueId('vlanAdd_');
    this.niVlanId = `${this.fid}_niVlanId`;
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
        width: 300,
      },
    ];
    const availVlanIdRange = this._calcAvailVlanIdRange(this.props);
    this.state = {
      availVlanIdRange,
      newVlanId: availVlanIdRange.firstItem(),
    };
  }

  componentWillReceiveProps(nextProps) {
    const availVlanIdRange = this._calcAvailVlanIdRange(nextProps);
    this.setState({
      availVlanIdRange,
      newVlanId: availVlanIdRange.firstItem(),
    });
  }

  _calcAvailVlanIdRange = (props) => {
    const range = new Range(props.constants.VLAN_ID_RANGE);
    const used = Object.keys(props.vlan.vlans).map( k => Number(k) );
    range.subtract(used);
    return range;
  };

  _onAddVlan = () => {
    this.props.actions.vlan.addVlan(this.state.newVlanId);
  };

  _onChangeNewVlanId = (evt) => {
    this.setState({ newVlanId: Number(evt.target.value) });
  };

  render() {
    const isValid = this.state.availVlanIdRange.has(this.state.newVlanId);
    return (
      <Layer
          className="edit"
          onClose={this.props.onClose}
          closer
          flush
          align="right">
        <Box pad="medium" className="flex1">
          <Title>{t('addVlan')}</Title>
          <br/>
          <b>{t('vlanIdsAvailable')}</b>
          <span>{this.state.availVlanIdRange.toString()}</span>
          <NumberInput
              className={isValid ? null : 'error'}
              id={this.niVlanId}
              name={this.niVlanId}
              label={this.niVlanId}
              value={this.state.newVlanId}
              onChange={this._onChangeNewVlanId} />
          <Footer pad={{vertical: 'medium'}}>
            <Menu direction="row" justify="end">
              <Button
                  label={t('addVlan')}
                  primary
                  onClick={isValid ? this._onAddVlan : null}/>
            </Menu>
          </Footer>
          <hr/>
          <DataGrid width={420} height={400}
              title={t('currentVlans')}
              data={this.props.vlan.vlans}
              columns={this.vlanCols}
              noSelect
          />
        </Box>
      </Layer>
    );
  }
}

function select(store) {
  return {
    constants: store.constants,
    vlan: store.vlan,
  };
}

export default connect(select)(VlanAdd);
