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

import './metricChart.scss';

import React, { Component, PropTypes } from 'react';
import Chart from 'grommet/components/Chart';


export default class MetricChart extends Component {

  static propTypes = {
    metric: PropTypes.object.isRequired,
    onSelect: PropTypes.func,
    points: PropTypes.bool,
    size: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      selection: {}
    };
  }

  _onSelect = (e) => {
    let el = this.state.selection.el;
    if (el) {
      el.classList.remove('selected');
    }
    el = e.target;
    el.classList.add('selected');

    const marker = e.dispatchMarker;
    const loc = marker.substr(marker.indexOf('_x_band_') + 8);
    const s = loc.split('.');
    const x = s[0];
    const dp = this.props.metric.getDataPoint(x);

    const selection = { dp, el, x };

    this.setState({ selection });

    if (this.props.onSelect) {
      this.props.onSelect(dp);
    }
  };

  render() {
    const len = this.props.metric.size();
    let chart = null;

    if (len > 0) {
      const series0 = [];
      const xAxisData = [];
      for (let i=len-1; i>=0; i--) {
        const x = i + 1;
        const dp = this.props.metric.getDataPoint(i);
        series0.push( [x, dp.value()] );
        xAxisData.push({
          value: x,
          label: new Date(dp.ts()).toLocaleTimeString(),
        });
      }
      chart = (
        <Chart
            series={[
            {values: series0, colorIndex: this.props.metric.getColorIndex() }
            ]}
            type="area"
            smooth
            legend={{position: 'after'}}
            units={this.props.metric.getUnits()}
            min={this.props.metric.min()}
            max={this.props.metric.max() * 1.25}
            xAxis={{
              data: xAxisData,
              placement: 'bottom',
            }}
            size={this.props.size}
            points={this.props.points}
        />
      );
    }

    // Note: using the 'key' property below forces a redraw of the chart if
    // you change the metric property. Without this, changing the metric
    // property does not completely redraw the chart.
    return (
      <div
          key={this.props.metric.getName()}
          className="metricChart"
          onClick={this.props.onSelect ? this._onSelect : null}>
        {chart}
      </div>
    );
  }

}
