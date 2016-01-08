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

import './overview.scss';

import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { t } from 'i18n/lookup.js';
import Box from 'grommet/components/Box';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Table from 'grommet/components/Table';
import FetchToolbar from 'fetchToolbar.jsx';
import Metric from 'metric.js';
import DataPoint from 'dataPoint.js';
import MetricTableChart from 'metricTableChart.jsx';
import SpanStatus from 'spanStatus.jsx';


class OverviewPage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    overview: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.cols = [
      { columnKey: 'id', header: t('id'), width: 100 },
      { columnKey: 'text', header: t('text'), width: 200, flexGrow: 1 },
    ];
    this.entities = {
      '1': { id: 1, text: 'Item 1' },
      '2': { id: 2, text: 'This 2' },
      '3': { id: 3, text: 'This 3' },
      '4': { id: 4, text: 'Item 4' },
      '5': { id: 5, text: 'This 5' },
      '6': { id: 6, text: 'This 6' },
      '7': { id: 7, text: 'Item 7' },
      '8': { id: 8, text: 'This 8' },
      '9': { id: 9, text: 'This 9' },
      '10': { id: 10, text: 'Item 10' },
      '11': { id: 11, text: 'Item 11' },
      '12': { id: 12, text: 'This 12' },
      '13': { id: 13, text: 'This 13' },
      '14': { id: 14, text: 'Item 14' },
      '15': { id: 15, text: 'This 15' },
      '16': { id: 16, text: 'This 16' },
      '17': { id: 17, text: 'Item 17' },
      '18': { id: 18, text: 'This 18' },
      '19': { id: 19, text: 'This 19' },
    };
    const ts = Date.now();
    const systemChartColor = 'graph-3';
    this.systemMetrics = [
      new Metric()
        .setName('Metric #1').setUnits('%')
        .setDataPoints([
          new DataPoint(1, ts, ['msg1 msg2']),
          new DataPoint(91, ts+1000, ['msg3']),
          new DataPoint(3, ts+2000, [])
        ])
        .setColorIndex(systemChartColor),
      new Metric()
        .setName('Metric #2').setUnits('GB').setThresholds(0, 500)
        .setDataPoints([
          new DataPoint(100, ts, ['msg1', 'msg2']),
          new DataPoint(50, ts+1000),
          new DataPoint(200, ts+2000)
        ])
        .setColorIndex(systemChartColor),
      new Metric()
        .setName('Metric #3').setThresholds(0, 3)
        .setDataPoints([
          new DataPoint(2.3, ts, ['msg1 msg2']),
          new DataPoint(1.1, ts+1000, ['msg3']),
          new DataPoint(0.8, ts+2000, [])
        ])
        .setColorIndex(systemChartColor),
    ];
    const networkChartColor = 'graph-4';
    this.networkMetrics = [
      new Metric()
        .setName('Metric #1').setUnits('%')
        .setDataPoints([
          new DataPoint(1, ts, ['msg1 msg2']),
          new DataPoint(91, ts+1000, ['msg3']),
          new DataPoint(3, ts+2000, [])
        ])
        .setColorIndex(networkChartColor),
      new Metric()
        .setName('Metric #2').setUnits('%')
        .setDataPoints([
          new DataPoint(11, ts, ['msg1 msg2']),
          new DataPoint(1, ts+1000, ['msg3']),
          new DataPoint(15, ts+2000, [])
        ])
        .setColorIndex(networkChartColor),
      new Metric()
        .setName('Metric #3').setUnits('%')
        .setDataPoints([
          new DataPoint(15, ts, ['msg1 msg2']),
          new DataPoint(8, ts+1000, ['msg3']),
          new DataPoint(35, ts+2000, [])
        ])
        .setColorIndex(networkChartColor),
    ];
    this.state = {};
  }

  componentDidMount() {
    this.props.actions.overview.fetchIfNeeded();
  }

  _onRefresh = () => {
    this.props.actions.overview.fetchIfNeeded();
  };

  componentWillReceiveProps(nextProps) {
    const overview = nextProps.overview;
    this.props.actions.toolbar.set(
      <FetchToolbar
          isFetching={overview.isFetching}
          error={overview.lastError}
          date={overview.lastUpdate}
          onRefresh={overview._onRefresh}/>
    );
  }

  componentWillUnmount() {
    this.props.actions.toolbar.clear();
  }

  _onClick = () => {
    this.props.actions.overview.readAll();
  };

  render() {
    return (
      <Box id="overviewPage" direction="row flex1">
        <Box className="flex1 pageBox">
          <Header>
            <Title>Information</Title>
          </Header>
          <Table>
            <tbody>
              <tr>
                <td><b>Product:</b></td>
                <td>Blah blah blah blah blah blah blah blah blah</td>
              </tr>
              <tr>
                <td><b>Vendor:</b></td>
                <td>Blah blah blah blah blah blah blah blah blah</td>
              </tr>
              <tr>
                <td><b>Version:</b></td>
                <td>Blah blah blah</td>
              </tr>
              <tr>
                <td><b>ONIE Version:</b></td>
                <td>Blah blah blah</td>
              </tr>
              <tr>
                <td><b>Base MAC:</b></td>
                <td>Blah blah blah</td>
              </tr>
            </tbody>
          </Table>
        </Box>
        <Box className="flex1 pageBox">
          <Header>
            <Title>System</Title>
          </Header>
          <Table>
            <tbody>
              <tr>
                <td><b>Storage:</b></td>
                <td><SpanStatus value="warning">112 of 150 GBs used</SpanStatus></td>
              </tr>
              <tr>
                <td><b>Power Supply:</b></td>
                <td><SpanStatus value="critical">1 of 2 power supplies down</SpanStatus></td>
              </tr>
              <tr>
                <td><b>Fans:</b></td>
                <td><SpanStatus value="ok">5 fans reporting</SpanStatus></td>
              </tr>
              <tr>
                <td><b>Temperatures:</b></td>
                <td><SpanStatus value="ok">3 sensors reporting</SpanStatus></td>
              </tr>
            </tbody>
          </Table>
          <MetricTableChart
              widths={{label: '130px', value: '70px'}}
              metrics={[
                { label: 'CPU Load', metric: this.systemMetrics[0] },
                { label: 'Memory', metric: this.systemMetrics[1] },
              ]}
              onSelectMetric={this._onSelectMetric}
              onSelectDataPoint={this._onSelectDataPoint}
          />
          <Table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Severity</th>
                <th>Syslog Message</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>4:22:50 PM</td>
                <td>Critical</td>
                <td>This is syslog message text for #1</td>
              </tr>
              <tr>
                <td>second</td>
                <td>second</td>
                <td>note 2</td>
              </tr>
              <tr>
                <td>second</td>
                <td>third</td>
                <td>note 3</td>
              </tr>
            </tbody>
          </Table>
        </Box>
        <Box className="flex1 pageBox">
          <Header>
            <Title>Network</Title>
          </Header>
          <Table>
            <tbody>
              <tr>
                <td><b>VLANs:</b></td>
                <td><SpanStatus value="warning">1-1000, 1003-4096 (4094 of 4096 used)</SpanStatus></td>
              </tr>
              <tr>
                <td><b>Interfaces:</b></td>
                <td>1-48, 49, 51</td>
              </tr>
              <tr>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
            </tbody>
          </Table>
          <MetricTableChart
              widths={{label: '130px', value: '70px'}}
              metrics={[
                { label: 'Interface 11', metric: this.networkMetrics[0] },
                { label: 'Interface 48', metric: this.networkMetrics[1] },
                { label: 'Interface 2', metric: this.networkMetrics[2] },
              ]}
              onSelectMetric={this._onSelectMetric}
              onSelectDataPoint={this._onSelectDataPoint}
          />
          <Table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Severity</th>
                <th>Syslog Message</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>4:22:50 PM</td>
                <td>Critical</td>
                <td>This is syslog message text for #1</td>
              </tr>
              <tr>
                <td>second</td>
                <td>second</td>
                <td>note 2</td>
              </tr>
              <tr>
                <td>second</td>
                <td>third</td>
                <td>note 3</td>
              </tr>
            </tbody>
          </Table>
        </Box>
      </Box>
    );
  }

}

function select(state) {
  return {
    overview: state.overview,
  };
}

export default connect(select)(OverviewPage);
