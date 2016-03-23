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
    overview: PropTypes.object.isRequired,
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
    this.props.actions.overview.fetch();
  };

  componentDidMount() {
    const p = this.props;
    this._onRefresh();
    p.actions.toolbar.setFetchTB(p.overview.asyncStatus, this._onRefresh);
  }

  componentWillReceiveProps(nextProps) {
    const p = nextProps;
    p.actions.toolbar.setFetchTB(p.overview.asyncStatus, this._onRefresh);
  }

  componentWillUnmount() {
    this.props.actions.toolbar.clear();
  }

  _mkSystemProps = () => {
    const info = this.props.overview.info;
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
    const ps = this.props.overview.powerSupplies;
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
    const fans = this.props.overview.fans;
    const trs = [];
    Object.getOwnPropertyNames(fans).sort().forEach(k => {
      const data = fans[k];
      const spd = <span><b>{t('speed')}:&nbsp;</b>{data.speed}</span>;
      const rpm = <span><b>{t('rpm')}:&nbsp;</b>{data.rpm}</span>;
      const dir = t(data.dir);
      trs.push(
        <tr key={data.id}>
          <td>
            {`${data.id}:`}
          </td>
          <td>
            <SpanStatus value={data.status}>
              {t(data.text)}
            </SpanStatus>
          </td>
          <td>-</td>
          <td><i>{spd},&nbsp;{rpm},&nbsp;{dir}</i></td>
        </tr>
      );
    });
    return (
      <table style={{width: '500px'}} className="propTable">
        <tbody>
          {trs}
        </tbody>
      </table>
    );
  };

  _mkTempsProps = () => {
    const temps = this.props.overview.temps;
    const trs = [];
    Object.getOwnPropertyNames(temps).sort().forEach(k => {
      const data = temps[k];
      const loc = <span><b>{t('location')}:&nbsp;</b>{data.location}</span>;
      trs.push(
        <tr key={data.id}>
          <td>{data.id}:</td>
          <td>
            <SpanStatus value={data.status}>
              {`${data.value} ${t('degreesCelsius')}`}
            </SpanStatus>
          </td>
          <td>-</td>
          <td><i>{loc}</i></td>
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
    const data = this.props.overview;
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
            <td>{info.numVlans}</td>
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

  // TODO: Not implemented
  _mkLog = () => {
    function tr(elm) {
      return (
        <tr key={elm.id}>
          <td>{new Date(elm.ts).toLocaleTimeString()}</td>
          <td><SpanStatus value={elm.sev}>{t(elm.sev)}</SpanStatus></td>
          <td>{elm.msg}</td>
        </tr>
      );
    }
    const logs = [];
    // TODO: No log info yet.
    const entries = {};
    Object.getOwnPropertyNames(entries).forEach(k => {
      logs.push(entries[k]);
    });
    logs.sort((l1, l2) => l1.ts < l2.ts);
    const rows = logs.map(e => tr(e));
    return (
      <table className="logTable">
        <tbody>
          {rows}
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

  _mkUtilization = () => {
    const data = this.props.collector;
    const metrics = data.interfaceTopMetrics.slice(0, NUM_TRAFFIC_METRICS);
    let caption = null;

    if (metrics.length === 0) {
      caption = (
        <div style={{textAlign: 'center'}}>
          <i>{t('noTopInterfaces')}</i>
        </div>
      );
    } else {
      const m = metrics[0];
      if (m.size() > 1) {
        const oldDate = new Date(m.getDataPoint(0).ts()).toLocaleTimeString();
        const newDate = new Date(m.latestDataPoint().ts()).toLocaleTimeString();
        caption = (
          <div>
            <small>
              {`${oldDate} - ${newDate} (${m.size()} ${t('dataPoints')})`}
            </small>
          </div>
        );
      }
    }

    return { metrics, caption };
  };

  render() {
    const ovData = this.props.overview;

    const psRollup = this._mkRollup(
      'powerSupplies',
      ovData.powerSuppliesRollup,
      this._onTogglePowerSuppliesLayer
    );
    const psLayer = !this.state.showPowerSuppliesLayer ? null :
      <StatusLayer
          onClose={this._onTogglePowerSuppliesLayer}
          title={t('powerSupplies')}
          value={ovData.powerSuppliesRollup.status}
      >
          {this._mkPowerSuppliesProps()}
      </StatusLayer>;

    const tempsRollup = this._mkRollup(
      'temperatures',
      ovData.tempsRollup,
      this._onToggleTempsLayer
    );
    const tempsLayer = !this.state.showTempsLayer ? null :
      <StatusLayer
          onClose={this._onToggleTempsLayer}
          title={t('temperatures')}
          value={ovData.tempsRollup.status}
      >
          {this._mkTempsProps()}
      </StatusLayer>;

    const fansRollup = this._mkRollup(
      'fans',
      ovData.fansRollup,
      this._onToggleFansLayer
    );
    const fansLayer = !this.state.showFansLayer ? null :
      <StatusLayer
          onClose={this._onToggleFansLayer}
          title={t('fans')}
          value={ovData.fansRollup.status}
      >
          {this._mkFansProps()}
      </StatusLayer>;

    const utl = this._mkUtilization();

    // TODO: get log start/end time and number added
    const logStart = new Date().toLocaleTimeString();
    const logEnd = new Date().toLocaleTimeString();
    const logNumAdded = 3;

    return (
      <Box className="flex1">
        {psLayer}
        {tempsLayer}
        {fansLayer}
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
                {tempsRollup}
                {fansRollup}
              </tbody>
            </table>
          </Box>
          <Box pad={this.pad} className="flex1 pageBox min300x300">
            <b>{t('topInterfaceUtilization')}</b>
            <hr/>
            <MetricTable
                simple
                onSelect={this._onSelectInterface}
                widths={{label: '70px', value: '70px'}}
                metrics={utl.metrics}
            />
            {utl.caption}
          </Box>
        </Box>
        <Box pad={this.pad} className="flex1 pageBox min300x400">
          <span><b>{t('log')}&nbsp;&nbsp;</b>
            <small>
              {`${logStart} - ${logEnd} (${logNumAdded} ${t('new')})`}
            </small>
          </span>
          <hr/>
          <div style={{overflow: 'auto'}}>
            {this._mkLog()}
          </div>
        </Box>
      </Box>
    );
  }

}

function select(store) {
  return {
    collector: store.collector,
    overview: store.overview,
  };
}

export default connect(select)(OverviewPage);
