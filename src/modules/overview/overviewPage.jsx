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
import { t, ed } from 'i18n/lookup.js';

import Box from 'grommet/components/Box';
import Table from 'grommet/components/Table';
import RefreshIcon from 'grommet/components/icons/base/Refresh';

import MetricTable from 'metricTable.jsx';
import SpanStatus from 'spanStatus.jsx';
import StatusLayer from 'statusLayer.jsx';


const NUM_TRAFFIC_METRICS = 5;

class OverviewPage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    autoActions: PropTypes.object.isRequired,
    collector: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.pad = {horizontal: 'small', vertical: 'small'};
    this.state = {
      showFansLayer: false,
      showPowerSuppliesLayer: false,
      showTempsLayer: false,
    };
  }

  _onRefresh = () => {
    this.props.autoActions.collector.fetch();
  };

  componentDidMount() {
    this.props.autoActions.collector.fetch();
    this.props.actions.toolbar.setFetchTB(
      this.props.collector.overview, this._onRefresh
    );
  }

  componentWillReceiveProps(nextProps) {
    this.props.actions.toolbar.setFetchTB(
      nextProps.collector.overview, this._onRefresh
    );
  }

  componentWillUnmount() {
    this.props.actions.toolbar.clear();
  }

  _mkSystemProps = () => {
    const info = this.props.collector.overview.info;
    return (
      <table style={{tableLayout: 'fixed'}} className="propTable">
        <tbody>
          <tr>
            <td style={{width: '140px', verticalAlign: 'top'}}>
              {t('partNumber')}:
            </td>
            <td>{info.partNum}</td>
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
    const ps = this.props.collector.overview.powerSupplies;
    const trs = [];
    Object.getOwnPropertyNames(ps).sort().forEach(k => {
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
    const fans = this.props.collector.overview.fans;
    const trs = [];
    Object.getOwnPropertyNames(fans).sort().forEach(k => {
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
    const temps = this.props.collector.overview.temps;
    const trs = [];
    Object.getOwnPropertyNames(temps).sort().forEach(k => {
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
          <a onClick={toggleLayerFn}>
            <SpanStatus value={rollupData.status}>
              <u>{t(rollupData.status)}</u>
            </SpanStatus>
          </a>
        </td>
      </tr>
    );
  };

  _mkFeatureProps = () => {
    const data = this.props.collector.overview;
    const info = data.info;
    return (
      <table style={{tableLayout: 'fixed'}} className="propTable">
        <tbody>
          <tr>
            <td style={{width: '180px'}}>{t('lldp')}:</td>
            <td>{ed(data.lldp.enabled)}</td>
          </tr>

          <tr>
            <td style={{width: '180px'}}>{t('ecmp')}:</td>
            <td>{t(data.ecmp.enabled)}</td>
          </tr>

          <tr>
            <td>{t('vlans')}:</td>
            <td>TBD</td>
          </tr>
          <tr>
            <td>{t('interfaces')}:</td>
            <td>{info.interfaceCount}</td>
          </tr>
          <tr>
            <td>{t('mtu')}:</td>
            <td>{info.mtu}</td>
          </tr>
          <tr>
            <td>{t('maxInterfaceSpeed')}:</td>
            <td>{info.maxInterfaceSpeed}</td>
          </tr>
        </tbody>
      </table>
    );
  };

  _onSelectInterface = (metric) => {
    this.props.history.pushState(
      null,
      `/monitorInterface/${metric.getGroup()}`
    );
  };

  render() {
    const coll = this.props.collector.overview;

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

    let trafficMetricsCaption = null;
    const trafficMetrics = coll.interfaceTopMetrics.slice(
      0, NUM_TRAFFIC_METRICS
    );

    if (trafficMetrics.length === 0) {
      trafficMetricsCaption = (
        <div style={{textAlign: 'center'}}>
          <RefreshIcon className="spin"/>
          {t('loading')}
        </div>
      );
    } else {
      const m = trafficMetrics[0];
      if (m.size() > 1) {
        const oldDate = new Date(m.getDataPoint(0).ts()).toLocaleTimeString();
        const newDate = new Date(m.latestDataPoint().ts()).toLocaleTimeString();
        trafficMetricsCaption = (
          <div>
            <div style={{textAlign: 'right'}}><small>
              {`${oldDate} - ${newDate}`}
            </small></div>
            <div style={{textAlign: 'right'}}><small>
              {`(${m.size()} ${t('dataPoints')})`}
            </small></div>
          </div>
        );
      }
    }

    // TODO: Warning: validateDOMNesting(...): <span> cannot appear as a child of <tbody>. See OverviewPage > tbody > StatusLayer > Layer > span.

    return (
      <Box className="flex1">
        <Box direction="row" className="flex0auto flexWrap">
          <Box pad={this.pad} className="flex1 pageBox min300x300">
            <b>{t('system')}</b>
            <hr/>
            {this._mkSystemProps()}
          </Box>
          <Box pad={this.pad} className="flex1 pageBox min300x300">
            <b>{t('features')}</b>
            <hr/>
            {this._mkFeatureProps()}
          </Box>
          <Box pad={this.pad} className="flex1 pageBox min300x300">
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
          <Box pad={this.pad} className="flex1 pageBox min300x300">
            <b>{t('traffic')}</b>
            <hr/>
            <MetricTable
                simple
                onSelect={this._onSelectInterface}
                widths={{label: '90px', value: '70px'}}
                metrics={trafficMetrics}
            />
            {trafficMetricsCaption}
          </Box>
        </Box>
        <Box pad={this.pad} className="flex1 pageBox min300x400">
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
