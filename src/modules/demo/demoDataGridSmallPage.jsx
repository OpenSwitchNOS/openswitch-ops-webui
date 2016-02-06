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
import Section from 'grommet/components/Section';
import Button from 'grommet/components/Button';


class DemoDataGridSmallPage extends Component {

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
      externalSelect: 2,
    };
  }

  componentDidMount() {
    this.props.actions.demo.fetch();
  }

  _onRefresh = () => {
    this.props.actions.demo.fetch();
  };

  componentWillReceiveProps(nextProps) {
    const demo = nextProps.demo;
    this.props.actions.toolbar.set(
      <FetchToolbar
          isFetching={demo.isFetching}
          error={demo.lastError}
          date={demo.lastUpdate}
          onRefresh={this._onRefresh}/>
    );
  }

  componentWillUnmount() {
    this.props.actions.toolbar.clear();
  }

  _onEdit = (selection) => {
    alert(selection);
  };

  _onSelectChange = (selection) => {
    alert(selection);
  };

  _onForceSelect = () => {
    const size = Object.keys(this.props.demo.entities).length;
    const externalSelect = (this.state.externalSelect + 1) % size;
    this.setState({ externalSelect });
  };

  render() {
    const demoProps = this.props.demo;
    return (
      <div className="mLeft">
        <Section>
          <DataGrid title="Full Toolbar" width={500} height={200}
              data={demoProps.entities}
              columns={this.cols}
              onEdit={this._onEdit}
          />
        </Section>
        <Section>
          <DataGrid title="Select / No Edit" width={500} height={200}
              data={demoProps.entities}
              columns={this.cols}
              onSelectChange={this._onSelectChange}
          />
        </Section>
        <Section>
          <DataGrid title="No Filter / Single Select" width={500} height={200}
              data={demoProps.entities}
              columns={this.cols}
              noFilter
              singleSelect
              select={[ this.state.externalSelect.toString() ]}
          />
          <Button
              label={`Select ID ${this.state.externalSelect + 1}`}
              onClick={this._onForceSelect}
          />
        </Section>
      </div>
    );
  }

}

const select = (store) => ({ demo: store.demo });

export default connect(select)(DemoDataGridSmallPage);
