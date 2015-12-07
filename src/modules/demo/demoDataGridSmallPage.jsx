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
import FetchInfo from 'fetchInfo.jsx';
import Section from 'grommet/components/Section';

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
  }

  componentDidMount() {
    this.props.actions.demo.fetchIfNeeded();
  }

  _onEdit = (selection) => {
    alert(selection);
  }

  _onSelectChange = (selection) => {
    alert(selection);
  }

  render() {
    const demoProps = this.props.demo;
    return (
      <div>
        <FetchInfo {...demoProps}/>
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
          />
        </Section>
      </div>
    );
  }

}

const select = (state) => ({ demo: state.demo });

export default connect(select)(DemoDataGridSmallPage);
