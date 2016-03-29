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
import DataGrid from 'dataGrid.jsx';
import Box from 'grommet/components/Box';
import Anchor from 'grommet/components/Anchor';
import NextIcon from 'grommet/components/icons/base/Next';
import PrevIcon from 'grommet/components/icons/base/Previous';


export default class OneToMany extends Component {

  static propTypes = {
    fullSet: PropTypes.object.isRequired,
    fullSetCols: PropTypes.array.isRequired,
    fullSetInit: PropTypes.object.isRequired,
    fullSetTitle: PropTypes.string,
    fullSetWidth: PropTypes.number,
    height: PropTypes.number,
    maxSubSetSize: PropTypes.number,
    onChange: PropTypes.func.isRequired,
    subSet: PropTypes.object.isRequired,
    subSetCols: PropTypes.array.isRequired,
    subSetInit: PropTypes.object.isRequired,
    subSetTitle: PropTypes.string,
    subSetWidth: PropTypes.number,
  };

  static defaultProps = {
    fullSetWidth: 200,
    subSetWidth: 200,
    height: 500,
  };

  constructor(props) {
    super(props);
    this.state = {
      fullSetSelect: [],
      subSetSelect: [],
    };
  }

  _onSelectChangeFullSet = (selection) => {
    let subSetOverLimit = false;
    if (this.props.maxSubSetSize) {
      const subSetSize = Object.keys(this.props.subSet).length;
      const newSubSetSize = subSetSize + selection.length;
      subSetOverLimit = newSubSetSize > this.props.maxSubSetSize;
    }
    this.setState({
      fullSetSelect: selection,
      subSetSelect: [],
      subSetOverLimit
    });
  };

  _onSelectChangeSubSet = (selection) => {
    this.setState({ fullSetSelect: [], subSetSelect: selection });
  };

  _diff = (subSet) => {
    const subSetKeys = Object.getOwnPropertyNames(subSet);
    const subSetInit = this.props.subSetInit;
    const subSetInitKeys = Object.getOwnPropertyNames(subSetInit);

    const removed = { ...subSetInit };
    subSetKeys.forEach(k => {
      if (removed[k]) { delete removed[k]; }
    });

    const added = { ...subSet };
    subSetInitKeys.forEach(k => {
      if (added[k]) { delete added[k]; }
    });

    const addedCount = Object.keys(added).length;
    const removedCount = Object.keys(removed).length;
    return { added, addedCount, removed, removedCount };
  };

  _onAddSubSet = () => {
    const fullSet = { ...this.props.fullSet };
    const subSet = { ...this.props.subSet };

    this.state.fullSetSelect.forEach(k => {
      subSet[k] = this.props.fullSet[k];
      delete fullSet[k];
    });

    this.setState({ fullSetSelect: [], subSetSelect: [] });

    const diff = this._diff(subSet);
    this.props.onChange(subSet, fullSet, diff);
  };

  _onRemoveSubSet = () => {
    const fullSet = { ...this.props.fullSet };
    const subSet = { ...this.props.subSet };

    this.state.subSetSelect.forEach(k => {
      fullSet[k] = this.props.subSet[k];
      delete subSet[k];
    });

    this.setState({ fullSetSelect: [], subSetSelect: [] });

    const diff = this._diff(subSet);
    this.props.onChange(subSet, fullSet, diff);
  };

  render() {
    const selInFull = this.state.fullSetSelect.length > 0;
    const over = this.state.subSetOverLimit;
    const selInSub = this.state.subSetSelect.length > 0;
    return (
      <Box>
        <Box direction="row">
          <DataGrid title={this.props.fullSetTitle}
              width={this.props.fullSetWidth}
              height={this.props.height}
              data={this.props.fullSet}
              columns={this.props.fullSetCols}
              noFilter
              select={this.state.fullSetSelect}
              onSelectChange={this._onSelectChangeFullSet}
          />
          <Box justify="center">
            <Anchor
                disabled={!selInFull || over}
                onClick={selInFull && !over ? this._onAddSubSet : null}>
              <NextIcon/>
            </Anchor>
            <Anchor
                disabled={!selInSub}
                onClick={selInSub ? this._onRemoveSubSet : null}>
              <PrevIcon/>
            </Anchor>
          </Box>
          <DataGrid title={this.props.subSetTitle}
              width={this.props.subSetWidth}
              height={this.props.height}
              data={this.props.subSet}
              columns={this.props.subSetCols}
              noFilter
              select={this.state.subSetSelect}
              onSelectChange={this._onSelectChangeSubSet}
          />
        </Box>
        <b style={{color: 'red'}}>
          {over ? `${t('exceededMax')}: ${this.props.maxSubSetSize}` : null}
          &nbsp;
        </b>
      </Box>
    );
  }

}
