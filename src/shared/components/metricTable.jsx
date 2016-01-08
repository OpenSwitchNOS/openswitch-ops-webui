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

import './metricTable.scss';

import React, { PropTypes, Component } from 'react';

import Table from 'grommet/components/Table';
import Chart from 'grommet/components/Chart';
import _ from 'lodash';


export default class MetricTable extends Component {

  static propTypes = {
    metrics: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      metric: PropTypes.object.isRequired,
    })).isRequired,
    onSelect: PropTypes.func,
    widths: PropTypes.shape({
      table: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      label: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      chart: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }),
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  _mkRow = (widths, metric, label) => {
    let chart = null;
    if (metric.size() > 0) {
      const values = metric.getDataPoints().map((dp, idx) => {
        return [ idx + 1, dp.value() ];
      });
      chart = (
        <Chart type="area" smooth series={[
          { values, colorIndex: metric.getColorIndex() }
        ]}/>
      );
    }

    const rowUid = _.uniqueId('mt_');
    const txt = label || metric.name();
    return (
      <tr key={rowUid}>
        <td className="labelCol" style={{width: widths.label}}><b>{txt}</b></td>
        <td className="valueCol" style={{width: widths.value}}>
          {metric.latestValueUnits()}
        </td>
        <td className="chartCol" style={{width: widths.chart}}>{chart}</td>
      </tr>
    );
  };

  _onSelect = (idx) => {
    const fn = this.props.onSelect;
    if (fn) { fn(this.props.metrics[idx].metric, idx); }
  };

  render() {
    const widths = this.props.widths;
    const rows = this.props.metrics.map(
      i => this._mkRow(widths, i.metric, i.label)
    );
    return (
      <div className="metricTable" style={{width: widths.table}}>
        <Table onSelect={this._onSelect} selectable>
          <tbody>
            {rows}
          </tbody>
        </Table>
      </div>
    );
  }

}
