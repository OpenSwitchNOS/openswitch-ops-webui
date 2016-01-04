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

import React, { Component } from 'react';

import Chart from 'grommet/components/Chart';
import Metric from 'metric.js';


export default class MetricChart extends Component {

  constructor(props) {
    super(props);
    // FIXME: hack for now
    this.metric = new Metric('n', '%', [100, 2, 30], 10, 100, 75, 90);
    this.syslog = [
      '3 Syslog - blah blah blah',
      'no Syslog',
      '2 Syslog - blah blah',
    ];

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

    this.setState({
      selection: { el, marker, x }
    });
  }

  render() {
    const x = this.state.selection.x;
    let chart = null;
    let selData = null;
    if (this.metric.size() > 0) {
      const values = this.metric.getValues().map((item, idx) => {
        return [ idx + 1, item ];
      });
      const dates = this.metric.getValues().map((item, idx) => {
        return { label: idx, value: idx+1 };
      });
      if (x != null) {
        selData = `${this.metric.getValue(x)} syslog: ${this.syslog[x]}`;
      }
      chart = (
        <Chart
            series={[
              {
                values,
                label: this.metric.name(),
              },
            ]}
            type="area"
            smooth
            legend={{position: 'after'}}
            units={this.metric.units()}
            max={this.metric.max() * 1.25}
            xAxis={{
              data: dates,
              placement: 'bottom',
            }}
        />
      );
    }

    return (
      <div className="metricChart" onClick={this._onSelect}>
        {chart}
        <div>Selected X: {this.state.selection.x}, data: {selData}</div>
      </div>
    );
  }

}
