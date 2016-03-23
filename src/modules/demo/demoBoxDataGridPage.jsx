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
import ResponsiveBox from 'responsiveBox.jsx';
import Box from 'grommet/components/Box';
import Button from 'grommet/components/Button';


class DemoBoxPage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    demo: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = { show: true };
    this.pad = {horizontal: 'small', vertical: 'small'};
    this.cols = [
      {
        columnKey: 'id',
        header: t('id'),
        width: 200,
        align: 'center',
        flexGrow: 1,
      },
      {
        columnKey: 'text',
        header: t('text'),
        width: 200,
        flexGrow: 1,
      },
    ];
  }

  componentDidMount() {
    this.props.actions.demo.fetch();
  }

  _onRefresh = () => {
    this.props.actions.demo.fetch();
  };

  _onClick = () => {
    const show = !this.state.show;
    this.setState({ show });
  };

  componentWillReceiveProps(nextProps) {
    const p = nextProps;
    p.actions.toolbar.setFetchTB(p.demo.asyncStatus, this._onRefresh);
  }

  componentWillUnmount() {
    this.props.actions.toolbar.clear();
  }

  render() {
    return (
      <Box direction="row" className="flex1">
        <Box className="flex1">
          <Box pad={this.pad} className="flex0auto pageBox min200x400">
            <b>Box</b>Col1 Row1 (min 200x400)
            <Button onClick={this._onClick} label="Toggle Col2"/>
            <br/>
            This page consists of a top-level Box (row) with 2 columns.
            <br/>
            The first (left) column is a parent Box (column) that contains
            2 Boxes. The first (top) Box doesn't expand vertically.
            The second (bottom) box contains a ResponsiveBox that, in turn,
            contains a DataGrid. <i>The ResponsiveBox must be contained within
            a parent Box.</i> The DataGrid should expand vertically.
            <br/>
            Each Box should have similar background color and styling. There
            should be even gaps between the Boxes and between the Boxes and the
            page edges at all times.
          </Box>
          <Box className="flex1 mTopHalf mLeft">
            <ResponsiveBox>
              <DataGrid width={300} height={400}
                  data={this.props.demo.entities}
                  columns={this.cols}
                  noSelect
              />
            </ResponsiveBox>
          </Box>
        </Box>
        {!this.state.show ? null : (
          <Box pad={this.pad} className="pageBox min200x200">
            <b>Box</b>Col2 (min 200x200)
            <br/>
          </Box>
        )}
      </Box>
    );
  }

}

const select = (store) => ({ demo: store.demo });

export default connect(select)(DemoBoxPage);
