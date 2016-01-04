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
import RadioButton from 'grommet/components/RadioButton';
import Metric from 'metric.js';
import _ from 'lodash';


export default class MetricTable extends Component {

  static propTypes = {
    name: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      selection: {}
    };
  }

  _mkRow = (label, metric) => {
    const name = this.props.name;
    const uid = _.uniqueId('mt_');

    const rb = (
      <RadioButton id={uid} name={name} label="" onChange={this._onSelect}/>
    );

    let chart = null;
    if (metric.size() > 0) {
      const values = metric.getValues().map((item, idx) => {
        return [ idx + 1, item ];
      });
      chart = (
        <Chart
            series={[
              {
                values,
                colorIndex: metric.latestValueColorIndex(),
              }
            ]}
            type="area"
            smooth
        />
      );
    }

    return (
      <tr key={uid}>
        <td className="selectCol">{rb}</td>
        <td className="chartCol">{chart}</td>
        <td style={{width: '100px'}}><b>{label}</b></td>
        <td className="valueCol">{metric.latestValueAsText()}</td>
      </tr>
    );
  }

  render() {

    const tableBody = (
      <tbody>
        {this._mkRow('Row #1:', new Metric('n', '%', [1, 91, 3], 10, 100, 75, 90))}
        {this._mkRow('Row #2:', new Metric('n', '%', [1, 2, 75], 10, 100, 75, 90))}
        {this._mkRow('Row #3:', new Metric('n', '%', [100, 2, 30], 10, 100, 75, 90))}
      </tbody>
    );

    return (
      <Table className="metricTable">
        {tableBody}
      </Table>
    );
  }

}
