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
// import Header from 'grommet/components/Header';
import Meter from 'grommet/components/Meter';
import Table from 'grommet/components/Table';
import FetchToolbar from 'fetchToolbar.jsx';
import Metric from 'metric.js';
import LabeledMetric from 'labeledMetric.js';
import DataPoint from 'dataPoint.js';
import MetricTable from 'metricTable.jsx';
import SpanStatus from 'spanStatus.jsx';
import StatusLayer from 'statusLayer.jsx';


class OverviewPage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    autoActions: PropTypes.object.isRequired,
    collector: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.pad = {horizontal: 'small', vertical: 'small'};
    this.cols = [
      { columnKey: 'id', header: t('id'), width: 100 },
      { columnKey: 'text', header: t('text'), width: 200, flexGrow: 1 },
    ];
    const ts = Date.now();
    const networkChartColor = 'graph-3';
    this.networkLabeledMetrics = [
      new LabeledMetric('Interface 23',
        new Metric()
          .setName('Metric #1').setUnits('%')
          .setDataPoints([
            new DataPoint(1, ts, ['msg1 msg2']),
            new DataPoint(91, ts+1000, ['msg3']),
            new DataPoint(3, ts+2000, [])
          ])
          .setColorIndex(networkChartColor)
      ),
      new LabeledMetric('Interface 3',
        new Metric()
          .setName('Metric #2').setUnits('%')
          .setDataPoints([
            new DataPoint(11, ts, ['msg1 msg2']),
            new DataPoint(1, ts+1000, ['msg3']),
            new DataPoint(15, ts+2000, [])
          ])
          .setColorIndex(networkChartColor)
      ),
      new LabeledMetric('Interface 15',
        new Metric()
          .setName('Metric #3').setUnits('%')
          .setDataPoints([
            new DataPoint(15, ts, ['msg1 msg2']),
            new DataPoint(8, ts+1000, ['msg3']),
            new DataPoint(35, ts+2000, [])
          ])
          .setColorIndex(networkChartColor)
      ),
      new LabeledMetric('Interface 15',
        new Metric()
          .setName('Metric #3').setUnits('%')
          .setDataPoints([
            new DataPoint(15, ts, ['msg1 msg2']),
            new DataPoint(8, ts+1000, ['msg3']),
            new DataPoint(35, ts+2000, [])
          ])
          .setColorIndex(networkChartColor)
      ),
      new LabeledMetric('Interface 15',
        new Metric()
          .setName('Metric #3').setUnits('%')
          .setDataPoints([
            new DataPoint(15, ts, ['msg1 msg2']),
            new DataPoint(8, ts+1000, ['msg3']),
            new DataPoint(35, ts+2000, [])
          ])
          .setColorIndex(networkChartColor)
      ),
    ];
    this.state = {
      selectedLabeledMetric: this.networkLabeledMetrics[0],
      showFansLayer: false,
    };
  }

  _setToolbar = (props) => {
    const collector = props.collector;
    this.props.actions.toolbar.set(
      <FetchToolbar
          isFetching={collector.isFetching}
          error={collector.lastError}
          date={collector.lastUpdate}
          onRefresh={this._onRefresh}
      />
    );
  };

  componentDidMount() {
    this.props.autoActions.collector.fetch();
    this.props.actions.toolbar.setFetchTB(this.props.collector, this._onRefresh);
  }

  _onRefresh = () => {
    this.props.autoActions.collector.fetch();
  };

  componentWillReceiveProps(nextProps) {
    this.props.actions.toolbar.setFetchTB(nextProps.collector, this._onRefresh);
  }

  componentWillUnmount() {
    this.props.actions.toolbar.clear();
  }

  _onSelectMetric = (selectedLabeledMetric) => {
    this.setState({ selectedLabeledMetric });
  };

  _mkInfoProps = () => {
    const info = this.props.collector.info;
    return (
      <table style={{tableLayout: 'fixed'}} className="propTable">
        <tbody>
          <tr>
            <td style={{width: '140px', verticalAlign: 'top'}}>
              {t('productName')}:
            </td>
            <td>{info.product}</td>
          </tr>
          <tr>
            <td>{t('serialNumber')}:</td>
            <td>{info.serialNum}</td>
          </tr>
          <tr>
            <td>{t('vendor')}:</td>
            <td>{info.vendor}</td>
          </tr>
          <tr>
            <td>{t('version')}:</td>
            <td>{info.version}</td>
          </tr>
          <tr>
            <td>{t('onieVersion')}:</td>
            <td>{info.onieVersion}</td>
          </tr>
          <tr>
            <td>{t('baseMac')}:</td>
            <td>{info.baseMac}</td>
          </tr>
        </tbody>
      </table>
    );
  };

  _mkHw = () => {
    const ps = this.props.collector.powerSupplies;
    const trs = [];
    Object.getOwnPropertyNames(ps).forEach(k => {
      const data = ps[k];
      trs.push(
        <tr key={data.id}>
          <td><a>{data.id}:</a></td>
          <td>
            <a href="#/syslog">
              <SpanStatus value={data.status}>Test</SpanStatus>
            </a>
          </td>
        </tr>
      );
    });
    return (
      <table className="propTable">
        <tbody>
          {trs}
        </tbody>
      </table>
    );
  };

  _mkPowerProps = () => {
    const ps = this.props.collector.powerSupplies;
    const trs = [];
    Object.getOwnPropertyNames(ps).forEach(k => {
      const data = ps[k];
      trs.push(
        <tr key={data.id}>
          <td>{data.id}:</td>
          <td>
            <SpanStatus value={data.status}>
              {t(data.text)}
            </SpanStatus>
          </td>
        </tr>
      );
    });
    return (
      <table className="propTable">
        <tbody>
          {trs}
        </tbody>
      </table>
    );
  };

  _mkFanProps = () => {
    const fans = this.props.collector.fans;
    const trs = [];
    Object.getOwnPropertyNames(fans).forEach(k => {
      const data = fans[k];
      trs.push(
        <tr key={data.id}>
          <td>{data.id}:</td>
          <td>
            <SpanStatus value={data.status}>
            {t(data.text)}
            </SpanStatus>
          </td>
        </tr>
      );
    });
    return (
      <table className="propTable">
        <tbody>
          {trs}
        </tbody>
      </table>
    );
  };

  _mkFansRollup = () => {
    const fansRollup = this.props.collector.fansRollup;
    const status =
      fansRollup.critical ? 'critical' :
        fansRollup.warning ? 'warning' :
          fansRollup.ok ? 'ok' : 'unknown';
    return (
      <table className="propTable">
        <tbody>
          <tr>
            <td>{t('fans')}:</td>
            <td>
              <a onClick={this._onToggleFansLayer}>
                <SpanStatus value={status}>{t(status)}</SpanStatus>
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    );
  };

  _mkTempMeters = () => {
    const temps = this.props.collector.temps;
    const meters = [];
    Object.getOwnPropertyNames(temps).forEach(k => {
      const data = temps[k];
      meters.push(
        <Box key={k} pad={{horizontal: 'small'}}>
        <span>{data.id}&nbsp;{data.location}</span>
          <br/>
          <Meter
              size="small"
              value={40}
              series={[{value: data.value, colorIndex: 'graph-3'}]}
              min={{value: data.min, label: data.min}}
              max={{value: data.max, label: data.max}}
              units={t('degreesCelsius')}
              />
        </Box>
      );
    });
    return (
      <Box direction="row">
        {meters}
      </Box>
    );
  };

  _mkTempProps = () => {
    const temps = this.props.collector.temps;
    const trs = [];
    Object.getOwnPropertyNames(temps).forEach(k => {
      const data = temps[k];
      trs.push(
        <tr key={data.id}>
          <td>{data.id}&nbsp;{data.location}:</td>
          <td>
            <SpanStatus value={data.status}>
              {t(data.value)}
            </SpanStatus>
          </td>
        </tr>
      );
    });
    return (
      <table className="propTable">
        <tbody>
          {trs}
        </tbody>
      </table>
    );
  };

  _mkNetworkProps = () => {
    return (
      <table style={{tableLayout: 'fixed'}} className="propTable">
        <tbody>
          <tr>
            <td style={{width: '140px'}}>{t('vlans')}:</td>
            <td>TBD</td>
          </tr>
          <tr>
            <td>{t('interfaces')}:</td>
            <td>{this.props.collector.interfaces.length}</td>
          </tr>
          <tr>
            <td>{t('mtu')}:</td>
            <td>TBD</td>
          </tr>
        </tbody>
      </table>
    );
  };

  _mkFeatureProps = () => {
    return (
      <table style={{tableLayout: 'fixed'}} className="propTable">
        <tbody>
          <tr>
            <td style={{width: '140px'}}>{t('Protocol#1')}:</td>
            <td>{t('disabled')}</td>
          </tr>
          <tr>
            <td>{t('Protocol#2')}:</td>
            <td>{t('enabled')}</td>
          </tr>
          <tr>
            <td>{t('Protocol#3')}:</td>
            <td>{t('enabled')}</td>
          </tr>
        </tbody>
      </table>
    );
  };

  _onToggleFansLayer = () => {
    const showFansLayer = !this.state.showFansLayer;
    this.setState({ showFansLayer });
  };

  render() {
    return (
      <Box className="flex1">
        <Box direction="row" className="flex0auto flexWrap">
          <Box pad={this.pad} className="flex1 pageBox min200x200">
            <b>{t('system')}</b>
            <hr/>
            {this._mkInfoProps()}
          </Box>
          <Box pad={this.pad} className="flex1 pageBox min200x200">
            <b>{t('hardware')}</b>
            <hr/>
            {this._mkHw()}
            <br/>
            {this._mkTempProps()}
            <br/>
            {this._mkFansRollup()}
            {!this.state.showFansLayer ? null :
            <StatusLayer
                onClose={this._onToggleFansLayer}
                title={t('Fan Status')}
                value="ok">
                {this._mkFanProps()}
            </StatusLayer>
            }
          </Box>
          <Box pad={this.pad} className="flex1 pageBox min200x200">
            <b>{t('features')}</b>
            <hr/>
            {this._mkFeatureProps()}
            <br/>
            {this._mkNetworkProps()}
          </Box>
          <Box pad={this.pad} className="flex1 pageBox min200x200">
            <b>{t('traffic')}</b>
            <hr/>
            <Box pad={{vertical: 'small'}}>
              <MetricTable
                  onSelect={this._onSelectMetric}
                  widths={{label: '130px', chart: '90px', value: '70px'}}
                  labeledMetrics={this.networkLabeledMetrics}
              />
            </Box>
          </Box>
        </Box>
        <Box pad={this.pad} className="flex1 pageBox min200x400">
          <span><b>{t('syslog')}&nbsp;&nbsp;</b><small>4:41:35 PM to 4:41:45 PM</small></span>
          <hr/>
          <Table>
            <tbody>
              <tr>
                <td>Critical</td>
                <td>4:22:50 PM</td>
                <td>System</td>
                <td>This is syslog message text for #1 This is syslog message text for #1 his is syslog</td>
              </tr>
              <tr>
                <td>Critical</td>
                <td>4:22:50 PM</td>
                <td>System</td>
                <td>This is syslog message text for #1 This is syslog message text for #1 his is syslog</td>
              </tr>
              <tr>
                <td>Critical</td>
                <td>4:22:50 PM</td>
                <td>System</td>
                <td>This is syslog message text for #1 This is syslog message text for #1 his is syslog</td>
              </tr>
            </tbody>
          </Table>
        </Box>
      </Box>
    );
  }

}

function select(store) {
  return {
    collector: store.collector,
  };
}

export default connect(select)(OverviewPage);
