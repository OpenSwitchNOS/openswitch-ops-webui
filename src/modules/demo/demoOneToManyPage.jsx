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
import Box from 'grommet/components/Box';
import Anchor from 'grommet/components/Anchor';
import NextIcon from 'grommet/components/icons/base/Next';
import PrevIcon from 'grommet/components/icons/base/Previous';


class OneToManyPage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    demo: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.cols = [
      {
        columnKey: 'id',
        header: t('id'),
        width: 180,
      },
    ];
    this.state = {
      selectFullset: [],
      selectSubset: [],
      subsetEntities: {},
      fullsetEntities: {},
    };
  }

  _onRefresh = () => {
    this.props.actions.demo.fetch();
  };

  componentDidMount() {
    const p = this.props;
    p.actions.demo.fetch();
  }

  componentWillReceiveProps(nextProps) {
    const p = nextProps;
    this.setState({ fullsetEntities: p.demo.entities });
  }

  _onSelectChangeFullset = (selection) => {
    this.setState({ selectFullset: selection, selectSubset: [] });
  };

  _onSelectChangeSubset = (selection) => {
    this.setState({ selectFullset: [], selectSubset: selection });
  };

  _onAddSubset = () => {
    const fullsetEntities = { ...this.state.fullsetEntities };
    const subsetEntities = { ...this.state.subsetEntities };
    this.state.selectFullset.forEach(k => {
      subsetEntities[k] = fullsetEntities[k];
      delete fullsetEntities[k];
    });
    this.setState({
      fullsetEntities,
      subsetEntities,
      selectFullset: [],
      selectSubset: [],
    });
  };

  _onDelSubset = () => {
    const fullsetEntities = { ...this.state.fullsetEntities };
    const subsetEntities = { ...this.state.subsetEntities };
    this.state.selectSubset.forEach(k => {
      fullsetEntities[k] = subsetEntities[k];
      delete subsetEntities[k];
    });
    this.setState({
      fullsetEntities,
      subsetEntities,
      selectFullset: [],
      selectSubset: [],
    });
  };

  render() {
    const selInFull = this.state.selectFullset.length > 0;
    const selInSub = this.state.selectSubset.length > 0;
    return (
      <Box className="mLeft mTop" direction="row">
        <DataGrid title="Fullset" width={this.cols[0].width} height={500}
            data={this.state.fullsetEntities}
            columns={this.cols}
            noFilter
            select={this.state.selectFullset}
            onSelectChange={this._onSelectChangeFullset}
        />
        <Box justify="center">
          <Anchor
              disabled={!selInFull}
              onClick={selInFull ? this._onAddSubset : null}>
            <NextIcon/>
          </Anchor>
          <Anchor
              disabled={!selInSub}
              onClick={selInSub ? this._onDelSubset : null}>
            <PrevIcon/>
          </Anchor>
        </Box>
        <DataGrid title="Subset" width={this.cols[0].width} height={500}
            data={this.state.subsetEntities}
            columns={this.cols}
            noFilter
            select={this.state.selectSubset}
            onSelectChange={this._onSelectChangeSubset}
        />
      </Box>
    );
  }

}

const select = (store) => ({ demo: store.demo });

export default connect(select)(OneToManyPage);
