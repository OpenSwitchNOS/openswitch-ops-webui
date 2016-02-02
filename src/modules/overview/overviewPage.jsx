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
import Table from 'grommet/components/Table';
import FetchToolbar from 'fetchToolbar.jsx';
import Metric from 'metric.js';
import DataPoint from 'dataPoint.js';
import MetricTable from 'metricTable.jsx';
import SpanStatus from 'spanStatus.jsx';
import StatusLayer from 'statusLayer.jsx';


const CHART_COLOR = 'graph-2';
const NUM_TRAFFIC_METRICS = 7;

class OverviewPage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    autoActions: PropTypes.object.isRequired,
    collector: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.pad = {horizontal: 'small', vertical: 'small'};
    const ts = Date.now();
    this.trafficMetrics = [
      new Metric()
        .setName('Metric #1').setUnits('%')
        .setDataPoints([
          new DataPoint(1, ts, ['msg1 msg2']),
          new DataPoint(91, ts+1000, ['msg3']),
          new DataPoint(3, ts+2000, [])
        ])
        .setColorIndex(CHART_COLOR),
      new Metric()
        .setName('Metric #2').setUnits('%')
        .setDataPoints([
          new DataPoint(11, ts, ['msg1 msg2']),
          new DataPoint(1, ts+1000, ['msg3']),
          new DataPoint(15, ts+2000, [])
        ])
        .setColorIndex(CHART_COLOR),
      new Metric()
        .setName('Metric #3').setUnits('%')
        .setDataPoints([
          new DataPoint(15, ts, ['msg1 msg2']),
          new DataPoint(8, ts+1000, ['msg3']),
          new DataPoint(35, ts+2000, [])
        ])
        .setColorIndex(CHART_COLOR),
    ];
    this.state = {
      showFansLayer: false,
      showPowerSuppliesLayer: false,
      showTempsLayer: false,
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

  _mkSystemProps = () => {
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

  _mkPowerSuppliesProps = () => {
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

  _mkFansProps = () => {
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

  _mkTempsProps = () => {
    const temps = this.props.collector.temps;
    const trs = [];
    Object.getOwnPropertyNames(temps).forEach(k => {
      const data = temps[k];
      trs.push(
        <tr key={data.id}>
          <td>{data.id}&nbsp;{data.location}:</td>
          <td>
            <SpanStatus value={data.status}>
              {`${data.value} ${t('degreesCelsius')}`}
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

  _onToggleFansLayer = () => {
    const showFansLayer = !this.state.showFansLayer;
    this.setState({ showFansLayer });
  };

  _onTogglePowerSuppliesLayer = () => {
    const showPowerSuppliesLayer = !this.state.showPowerSuppliesLayer;
    this.setState({ showPowerSuppliesLayer });
  };

  _onToggleTempsLayer = () => {
    const showTempsLayer = !this.state.showTempsLayer;
    this.setState({ showTempsLayer });
  };

  _mkRollup = (labelKey, rollupData, toggleLayerFn) => {
    return (
      <tr>
        <td>{t(labelKey)}:</td>
        <td>
          <SpanStatus value={rollupData.status}>
            <a onClick={toggleLayerFn}>
              <u>{t(rollupData.status)}</u>
            </a>
          </SpanStatus>
        </td>
      </tr>
    );
  };

  _mkFeatureProps = () => {
    return (
      <table style={{tableLayout: 'fixed'}} className="propTable">
        <tbody>
          <tr>
            <td style={{width: '180px'}}>{t('Protocol#1')}:</td>
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
          <tr>
            <td>{t('vlans')}:</td>
            <td>TBD</td>
          </tr>
          <tr>
            <td>{t('interfaces')}:</td>
            <td>{this.props.collector.info.interfaceCount}</td>
          </tr>
          <tr>
            <td>{t('mtu')}:</td>
            <td>{this.props.collector.info.mtu}</td>
          </tr>
          <tr>
            <td>{t('maxInterfaceSpeed')}:</td>
            <td>{this.props.collector.info.maxInterfaceSpeed}</td>
          </tr>
        </tbody>
      </table>
    );
  };

  render() {
    const coll = this.props.collector;

    const psRollup = this._mkRollup(
      'powerSupplies',
      coll.powerSuppliesRollup,
      this._onTogglePowerSuppliesLayer
    );
    const psLayer = !this.state.showPowerSuppliesLayer ? null :
      <StatusLayer
          onClose={this._onTogglePowerSuppliesLayer}
          title={t('powerSupplies')}
          value={coll.powerSuppliesRollup.status}>
          {this._mkPowerSuppliesProps()}
      </StatusLayer>;

    const tempsRollup = this._mkRollup(
      'temperatures',
      coll.tempsRollup,
      this._onToggleTempsLayer
    );
    const tempsLayer = !this.state.showTempsLayer ? null :
      <StatusLayer
          onClose={this._onToggleTempsLayer}
          title={t('temperatures')}
          value={coll.tempsRollup.status}>
          {this._mkTempsProps()}
      </StatusLayer>;

    const fansRollup = this._mkRollup(
      'fans',
      coll.fansRollup,
      this._onToggleFansLayer
    );
    const fansLayer = !this.state.showFansLayer ? null :
      <StatusLayer
          onClose={this._onToggleFansLayer}
          title={t('fans')}
          value={coll.fansRollup.status}>
          {this._mkFansProps()}
      </StatusLayer>;

    const trafficMetrics = coll.interfaceUtilizationMetrics.slice(
      0, NUM_TRAFFIC_METRICS
    );

    return (
      <Box className="flex1">
        <Box direction="row" className="flex0auto flexWrap">
          <Box pad={this.pad} className="flex1 pageBox min200x200">
            <b>{t('system')}</b>
            <hr/>
            {this._mkSystemProps()}
          </Box>
          <Box pad={this.pad} className="flex1 pageBox min200x200">
            <b>{t('features')}</b>
            <hr/>
            {this._mkFeatureProps()}
          </Box>
          <Box pad={this.pad} className="flex1 pageBox min200x200">
            <b>{t('hardware')}</b>
            <hr/>
            <table className="propTable">
              <tbody>
              {psRollup}
              {psLayer}
              {tempsRollup}
              {tempsLayer}
              {fansRollup}
              {fansLayer}
              </tbody>
            </table>
          </Box>
          <Box pad={this.pad} className="flex1 pageBox min200x200">
            <b>{t('traffic')}</b>
            <hr/>
            <MetricTable
                simple
                widths={{label: '70px', value: '70px'}}
                metrics={trafficMetrics}
            />
          </Box>
        </Box>
        <Box pad={this.pad} className="flex1 pageBox min200x400">
          <span><b>{t('log')}&nbsp;&nbsp;</b><small>start-time to end-time</small></span>
          <hr/>
          <Table>
            <tbody>
              <tr>
                <td>4:22:59 PM</td>
                <td>Critical</td>
                <td>This is syslog message text for #1 This is syslog message text for #1 This is syslog message text for #1</td>
              </tr>
              <tr>
                <td>4:22:53 PM</td>
                <td>Critical</td>
                <td>This is syslog message text for #2 This is syslog message text for #2 This is syslog message text for #2</td>
              </tr>
              <tr>
                <td>4:22:50 PM</td>
                <td>Critical</td>
                <td>This is syslog message text for #3 This is syslog message text for #3 This is syslog message text for #3</td>
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
