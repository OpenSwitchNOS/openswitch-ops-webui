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

import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import MetricChart from 'metricChart.jsx';
import MetricTable from 'metricTable.jsx';

class DemoMetricPage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    demo: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="pageBox">
        <Header>
          <Title>MetricTable</Title>
        </Header>
        <MetricTable name="system"/>
        <Header>
          <Title>MetricChart</Title>
        </Header>
        <MetricChart />
      </div>
    );
  }

}

const select = (state) => ({ demo: state.demo });

export default connect(select)(DemoMetricPage);
