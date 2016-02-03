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

import MetricChart from 'metricChart.jsx';
import MetricTable from 'metricTable.jsx';


export default class MetricTableChart extends Component {

  static propTypes = {
    metrics: PropTypes.arrayOf(PropTypes.object).isRequired,
    onSelectDataPoint: PropTypes.func,
    onSelectMetric: PropTypes.func,
    widths: PropTypes.shape({
      table: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      label: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      chart: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }),
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedMetricIdx: 0,
      selectedDataPoint: null,
    };
  }

  _onSelectMetric = (metric, idx) => {
    this.setState({
      selectedMetricIdx: idx,
      selectedDataPoint: null,
    });
    const fn = this.props.onSelectMetric;
    if (fn) { fn(metric, idx); }
  };

  _onSelectDataPoint = (dp) => {
    this.setState({ selectedDataPoint: dp });
    const fn = this.props.onSelectDataPoint;
    if (fn) { fn(dp); }
  };

  render() {
    const idx = this.state.selectedMetricIdx;
    const sel = this.props.metrics[idx];
    return (
      <div>
        <MetricTable
            onSelect={this._onSelectMetric}
            widths={this.props.widths}
            metrics={this.props.metrics}
        />
        <div><b>{sel.getName()}</b></div>
        <MetricChart
            metric={sel}
            onSelect={this._onSelectDataPoint}/>
      </div>
    );
  }

}
