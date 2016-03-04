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
import FetchToolbar from 'fetchToolbar.jsx';
import Button from 'grommet/components/Button';
import Section from 'grommet/components/Section';
import Box from 'grommet/components/Box';

class DemoTables extends Component {

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
        width: 200,
      },
      {
        columnKey: 'text',
        header: t('text'),
        width: 300,
      },
    ];
    this.state = {
      entitiesData: {},
      externalSelect: 2,
      selection: 0,
    };
    this.add = false;
    this.remove = false;
    this.entities = {};
  }

  componentDidMount() {
    this.props.actions.demo.fetch();
  }

  _onRefresh = () => {
    this.props.actions.demo.fetch();
  };
  componentWillReceiveProps(nextProps) {
    const fetch = nextProps.demo.page;
    this.props.actions.toolbar.set(
      <FetchToolbar
          isFetching={fetch.inProgress}
          error={fetch.lastError}
          date={fetch.lastSuccessMillis}
          onRefresh={this._onRefresh}/>
    );
  }

  componentWillUnmount() {
    this.props.actions.toolbar.clear();
  }

  searchSelection = (selection) => {
    for (let i = 0; i <= 30; i++) {
      if (this.entities[i] === this.props.demo.page.entities[`${selection}`]) {
        return true;
      }
      return false;
    }
  };

  table2data = (selection) => {
    if (selection !== null) {
      if (this.add === true) {
        const elementExists = this.searchSelection(selection);
        if (!elementExists) {
          this.entities[`${selection}`] = this.props.demo.page.entities[`${selection}`];
          delete this.props.demo.page.entities[`${selection}`];
        } else {
          alert('This id already exists in Table 2');
        }
        this.add = false;
      }
      if (this.remove === true) {
        if (this.entities[`${selection}`]) {
          this.props.demo.page.entities[`${selection}`] = this.entities[`${selection}`];
        } else {
          alert('Contents of Table 1 Cannot be Removed.');
        }
        delete this.entities[`${selection}`];
        this.remove = false;
      }
      this.setState({entitiesData: this.entities});
    }
  };


  addtoTable = () => {
    this.add = true;
    const selection = this.state.selection;
    this.table2data(selection);

  };

  _onSelectChange = (selection) => {
    this.setState({selection});
  };

  removeRowFromTable = () => {
    this.remove = true;
    const selection = this.state.selection;
    this.table2data(selection);
  };

  _onForceSelect = () => {
    const size = Object.keys(this.props.demo.page.entities).length;
    const externalSelect = (this.state.externalSelect + 1) % size;
    this.setState({ externalSelect });
  };

  render() {
    const table1data = {...this.props.demo.page.entities};
    const entitiesDataToBeDisplayed = {...this.state.entitiesData};
    return (
      <div className="mLeft">
      <center>
      <Box direction="row">
      <Box>
        <DataGrid title="Table 1" width={500} height={700}
            data={table1data}
            columns={this.cols}
            singleSelect
            onSelectChange={this._onSelectChange}
        />
        </Box>

        <Section>
        <span>
        <Button
            label="Add To Table 2"
            onClick={this.addtoTable}
        />
        <br/>
        <Button
            label="Remove From Table 2"
            onClick={this.removeRowFromTable}
        />
        </span>
        </Section>
        <Box>
        <DataGrid title="Table 2" width={500} height={700}
            data={entitiesDataToBeDisplayed}
            columns={this.cols}
            singleSelect
            onSelectChange={this._onSelectChange}
        />
        </Box>

        </Box>
          </center>
      </div>
    );
  }

}

const select = (store) => ({ demo: store.demo });

export default connect(select)(DemoTables);
