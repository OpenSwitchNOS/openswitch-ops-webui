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
import Box from 'grommet/components/Box';
import Metric from 'metric.js';
import LabeledMetric from 'labeledMetric.js';
import DataPoint from 'dataPoint.js';
import MetricChart from 'metricChart.jsx';
import MetricTable from 'metricTable.jsx';
import MetricTableChart from 'metricTableChart.jsx';


class DemoMetricPage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    demo: PropTypes.object,
  };

  constructor(props) {
    super(props);
    const ts = Date.now();
    this.state = {
      selectedMetricIdx: 0,
      selectedDataPoint: null,
    };
    this.labeledMetrics = [
      new LabeledMetric('Label #1',
        new Metric()
          .setName('Metric #1').setUnits('%')
          .setDataPoints([
            new DataPoint(1, ts, ['msg1 msg2']),
            new DataPoint(91, ts+1000, ['msg3']),
            new DataPoint(3, ts+2000, [])
          ])
          .setColorIndex('graph-2')
      ),
      new LabeledMetric('Label #2',
        new Metric()
          .setName('Metric #2').setUnits('GB').setThresholds(0, 500)
          .setDataPoints([
            new DataPoint(100, ts, ['msg1', 'msg2']),
            new DataPoint(50, ts+1000),
            new DataPoint(200, ts+2000)
          ])
      ),
      new LabeledMetric('Label #3',
        new Metric()
          .setName('Metric #3').setThresholds(0, 3)
          .setDataPoints([
            new DataPoint(2.3, ts, ['msg1 msg2']),
            new DataPoint(1.1, ts+1000, ['msg3']),
            new DataPoint(0.8, ts+2000, [])
          ])
      ),
    ];
    this.pad = {horizontal: 'small', vertical: 'small'};
  }

  _onSelectMetric = (labeledMetric, idx) => {
    this.setState({
      selectedMetricIdx: idx,
      selectedDataPoint: null,
    });
  };

  _onSelectDataPoint = (dp) => {
    this.setState({ selectedDataPoint: dp });
  };

  render() {
    const sel = this.labeledMetrics[this.state.selectedMetricIdx];
    const dp = this.state.selectedDataPoint;
    return (
      <div>
        <Box pad={this.pad} className="pageBox">
          <Header>
            <Title>MetricTables</Title>
          </Header>
          <MetricTable
              onSelect={this._onSelectMetric}
              widths={{label: '130px', value: '70px'}}
              labeledMetrics={this.labeledMetrics}
          />
          <MetricTable
              onSelect={this._onSelectMetric}
              widths={{table: '500px', label: '130px', value: '70px'}}
              labeledMetrics={this.labeledMetrics}
          />
        </Box>
        <Box pad={this.pad} className="pageBox">
          <Header>
            <Title>MetricChart</Title>
          </Header>
          <MetricChart
              metric={sel.metric()}
              onSelect={this._onSelectDataPoint}/>
          <div>
            Selected datapoint value: {dp && dp.value()}
          </div>
          <div>
            Selected datapoint date: {dp && new Date(dp.ts()).toString()}
          </div>
          <div>
            Selected datapoint userdata: {dp && dp.userData()}
          </div>
        </Box>
        <Box pad={this.pad} className="pageBox">
          <Header>
            <Title>MetricTableChart</Title>
          </Header>
          <MetricTableChart
              widths={{label: '130px', value: '70px'}}
              labeledMetrics={this.labeledMetrics}
              onSelectMetric={this._onSelectMetric}
              onSelectDataPoint={this._onSelectDataPoint}
          />
        </Box>
      </div>
    );
  }

}

const select = (state) => ({ demo: state.demo });

export default connect(select)(DemoMetricPage);
