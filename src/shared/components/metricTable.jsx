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


function mkRow(widths, metric, onSelectFn) {
  const label = `${metric.getGroup()} ${metric.getName()}`;
  let chart = null;

  if (metric.size() > 1) {
    const values = metric.getDataPoints().map((dp, idx) => {
      return [ idx + 1, dp.value() ]; // FIXME: Grommet has a bug with 0 values here
    });
    chart = (
      <Chart
          max={metric.max()}
          min={metric.min()}
          threshold={metric.min()}
          type="area"
          smooth
          series={[
            { values, colorIndex: metric.getColorIndex() }
          ]}/>
    );
  }

  const rowUid = _.uniqueId('mt_');
  return (
    <tr
        key={rowUid}
        style={onSelectFn ? {cursor: 'pointer'} : null}
        onClick={onSelectFn}>
      <td className="labelCol" style={{width: widths.label}}>
        <b>
          {onSelectFn ? <u>{label}</u> : label}
        </b>
      </td>
      <td className="valueCol" style={{width: widths.value}}>
        {metric.latestValueUnits()}
      </td>
      <td className="chartCol" style={{width: widths.chart}}>
        {chart}
      </td>
    </tr>
  );
}

export default class MetricTable extends Component {

  static propTypes = {
    metrics: PropTypes.arrayOf(PropTypes.object).isRequired,
    onSelect: PropTypes.func,
    selection: PropTypes.number,
    simple: PropTypes.bool,
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

  _onSelect = (idx) => {
    const fn = this.props.onSelect;
    const m = this.props.metrics[idx];
    if (fn) { fn(m, idx); }
  };

  render() {
    const widths = this.props.widths;

    if (!this.props.simple) {
      const sel = this.props.selection;
      const rows = this.props.metrics.map(m => mkRow(widths, m));
      return (
        <div className="metricTable" style={{width: widths.table}}>
          <Table selection={sel} onSelect={this._onSelect} selectable>
            <tbody>
              {rows}
            </tbody>
          </Table>
        </div>
      );
    }
    const rows = this.props.metrics.map((m, idx) => {
      return mkRow(widths, m, this._onSelect.bind(this, idx));
    });
    return (
      <table className="metricTable simple" style={{width: widths.table}}>
        <tbody>
        {rows}
        </tbody>
      </table>
    );
  }

}
