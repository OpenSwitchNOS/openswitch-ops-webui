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
// import Title from 'grommet/components/Title';
import Table from 'grommet/components/Table';
import FetchToolbar from 'fetchToolbar.jsx';
import Metric from 'metric.js';
import LabeledMetric from 'labeledMetric.js';
import DataPoint from 'dataPoint.js';
import MetricTable from 'metricTable.jsx';
import MetricChart from 'metricChart.jsx';
// import SpanStatus from 'spanStatus.jsx';


class OverviewPage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    overview: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.pad = {horizontal: 'small', vertical: 'small'};
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
    this.systemLabeledMetrics = [
      new LabeledMetric(`${t('cpuLoad')}:`,
        new Metric()
          .setName('Metric #1').setUnits('')
          .setDataPoints([
            new DataPoint(1, ts, ['msg1 msg2']),
            new DataPoint(91, ts+1000, ['msg3']),
            new DataPoint(3, ts+2000, [])
          ])
          .setColorIndex(systemChartColor)
      ),
      new LabeledMetric(`${t('memory')}:`,
        new Metric()
          .setName('Metric #2').setUnits('GB').setThresholds(0, 500)
          .setDataPoints([
            new DataPoint(100, ts, ['msg1', 'msg2']),
            new DataPoint(50, ts+1000),
            new DataPoint(200, ts+2000)
          ])
          .setColorIndex(systemChartColor)
      ),
    ];
    const networkChartColor = 'graph-4';
    this.networkLabeledMetrics = [
      new LabeledMetric('Interface 23:',
        new Metric()
          .setName('Metric #1').setUnits('%')
          .setDataPoints([
            new DataPoint(1, ts, ['msg1 msg2']),
            new DataPoint(91, ts+1000, ['msg3']),
            new DataPoint(3, ts+2000, [])
          ])
          .setColorIndex(networkChartColor)
      ),
      new LabeledMetric('Interface 3:',
        new Metric()
          .setName('Metric #2').setUnits('%')
          .setDataPoints([
            new DataPoint(11, ts, ['msg1 msg2']),
            new DataPoint(1, ts+1000, ['msg3']),
            new DataPoint(15, ts+2000, [])
          ])
          .setColorIndex(networkChartColor)
      ),
      new LabeledMetric('Interface 15:',
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
    this.state = { selectedLabeledMetric: this.systemLabeledMetrics[0] };
  }

  componentDidMount() {
    this.props.actions.overview.fetch();
  }

  _onRefresh = () => {
    this.props.actions.overview.fetch();
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

  _onSelectMetric = (selectedLabeledMetric) => {
    this.setState({ selectedLabeledMetric });
  };

  _mkInfoProps = () => {
    return (
      <table className="propTable">
        <tbody>
          <tr>
            <td>{t('productName')}:</td>
            <td>TBD</td>
          </tr>
          <tr>
            <td>{t('serialNumber')}:</td>
            <td>TBD</td>
          </tr>
          <tr>
            <td>{t('vendor')}:</td>
            <td>TBD</td>
          </tr>
          <tr>
            <td>{t('version')}:</td>
            <td>TBD</td>
          </tr>
          <tr>
            <td>{t('onieVersion')}:</td>
            <td>TBD</td>
          </tr>
          <tr>
            <td>{t('baseMac')}:</td>
            <td>TBD</td>
          </tr>
          <tr>
            <td>{t('systemMac')}:</td>
            <td>TBD</td>
          </tr>
        </tbody>
      </table>
    );
  };

  _mkSystemProps = () => {
    return (
      <table className="propTable">
        <tbody>
          <tr>
            <td>{t('temperature')}:</td>
            <td>TBD</td>
          </tr>
          <tr>
            <td>{t('fans')}:</td>
            <td>TBD</td>
          </tr>
          <tr>
            <td>{t('power')}:</td>
            <td>TBD</td>
          </tr>
          <tr>
            <td>{t('storage')}:</td>
            <td>TBD</td>
          </tr>
        </tbody>
      </table>
    );
  };

  _mkNetworkProps = () => {
    return (
      <table className="propTable">
        <tbody>
          <tr>
            <td>{t('vlans')}:</td>
            <td>TBD</td>
          </tr>
          <tr>
            <td>{t('interfaces')}:</td>
            <td>TBD</td>
          </tr>
          <tr>
            <td>{t('mtu')}:</td>
            <td>TBD</td>
          </tr>
        </tbody>
      </table>
    );
  };

  render() {
    const label = this.state.selectedLabeledMetric.label();
    const metric = this.state.selectedLabeledMetric.metric();

    return (
      <Box className="flex1">
        <Box direction="row" className="flexWrap">
          <Box pad={this.pad} className="flex1 pageBox min200x200">
            <b>{t('information')}</b>
            <hr/>
            {this._mkInfoProps()}
          </Box>
          <Box pad={this.pad} className="flex1 pageBox min200x200">
            <b>{t('system')}</b>
            <hr/>
            {this._mkSystemProps()}
            <br/>
            <MetricTable
                onSelect={this._onSelectMetric}
                widths={{label: '130px', value: '70px'}}
                labeledMetrics={this.systemLabeledMetrics}
            />
          </Box>
          <Box pad={this.pad} className="flex1 pageBox min200x200">
            <b>{t('network')}</b>
            <hr/>
            {this._mkNetworkProps()}
            <br/>
            <b>{t('topUtilization')}</b>
            <br/>
            <MetricTable
                onSelect={this._onSelectMetric}
                widths={{label: '130px', value: '70px'}}
                labeledMetrics={this.networkLabeledMetrics}
            />
          </Box>
        </Box>
        <Box pad={this.pad} className="flex1 pageBox min200x400">
          <b>{label}</b>
          <MetricChart
              size="large"
              metric={metric}
              onSelect={this._onSelectDataPoint}/>
          <i>Syslog entries: [4:41:35 PM - 4:41:45 PM]</i>
          <Table>
            <thead>
              <tr>
                <th>Severity</th>
                <th>Date</th>
                <th>Facility</th>
                <th>Text</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Critical</td>
                <td>4:22:50 PM</td>
                <td>System</td>
                <td>This is syslog message text for #1</td>
              </tr>
              <tr>
                <td>Critical</td>
                <td>4:22:50 PM</td>
                <td>System</td>
                <td>This is syslog message text for #1</td>
              </tr>
              <tr>
                <td>Critical</td>
                <td>4:22:50 PM</td>
                <td>System</td>
                <td>This is syslog message text for #1</td>
              </tr>
            </tbody>
          </Table>
        </Box>
      {/*


/rest/v1/system/subsystems/base
        body: Object
          configuration: Object
          statistics: Object
        status: Object
         macs_remaining: 72
         name: "base"
         next_mac_address: "48:0f:cf:af:d1:34"
         other_info: Object

        Product Name: "HP Altoline 5712-48XG-6QSFP+ x86 ONIE AC Front-to-Back Switch"
        base_mac_address: "48:0f:cf:af:d1:32"
        country_code: "TW"
        device_version: ""
        diag_version: "2.0.1.3"
        interface_count: "78"
        l3_port_requires_internal_vlan: "1"
        label_revision: "R01I"
        manufacture_date: "07/25/2015 04:48:24"
        manufacturer: "Accton"
        max_bond_count: "1024"
        max_bond_member_count: "256"
        max_interface_speed: "40000"
        max_transmission_unit: "9216"
        number_of_macs: "74"
        onie_version: "2014.08.00.05"
        part_number: "FP18J5654000A"
        platform_name: "x86_64-accton_as5712_54x-r0"
        serial_number: "TW57HCR00N"
        vendor: "Hewlett-Packard"

/rest/v1/system
        body: Object
        configuration: Object
        asset_tag_number: "OpenSwitch asset tag"
        external_ids: Object
        fans: Array[10]
        0: "/rest/v1/system/subsystems/base/fans/base-1L"
        1: "/rest/v1/system/subsystems/base/fans/base-2R"
        2: "/rest/v1/system/subsystems/base/fans/base-4R"
        3: "/rest/v1/system/subsystems/base/fans/base-3L"
        4: "/rest/v1/system/subsystems/base/fans/base-5L"
        5: "/rest/v1/system/subsystems/base/fans/base-1R"
        6: "/rest/v1/system/subsystems/base/fans/base-2L"
        7: "/rest/v1/system/subsystems/base/fans/base-5R"
        8: "/rest/v1/system/subsystems/base/fans/base-4L"
        9: "/rest/v1/system/subsystems/base/fans/base-3R"
        length: 10
        __proto__: Array[0]
        interfaces: Array[78]
        leds: Array[1]
        0: "/rest/v1/system/subsystems/base/leds/base-loc"
        length: 1
        __proto__: Array[0]
        other_config: Object
        fan_speed_override: "slow"
        __proto__: Object
        power_supplies: Array[2]
        0: "/rest/v1/system/subsystems/base/power_supplies/base-2"
        1: "/rest/v1/system/subsystems/base/power_supplies/base-1"
        length: 2
        __proto__: Array[0]
        temp_sensors: Array[3]
        0: "/rest/v1/system/subsystems/base/temp_sensors/base-1"
        1: "/rest/v1/system/subsystems/base/temp_sensors/base-2"
        2: "/rest/v1/system/subsystems/base/temp_sensors/base-3"
        length: 3

        body: Object
        configuration: Object
        aaa: Object
        fallback: "true"
        radius: "false"
        ssh_passkeyauthentication: "enable"
        ssh_publickeyauthentication: "enable"
        __proto__: Object

        statistics: Object
        lldp_statistics: Object
        statistics: Object
        cpu: "4"
        file_systems: "/,1998672,308000 /var/local,122835,1894"
        load_average: "0.12,0.13,0.14"
        memory: "8167696,831088,499952,0,0"
        process_ops-arpmgrd: "27840,1416,34210,0,2402803314,2402803314"
        process_ops-bgpd: "41384,3912,20160,0,2402803113,2402803113"
        process_ops-fand: "39180,3704,1072210,0,2402803043,2402803043"
        process_ops-intfd: "28636,2204,160,0,2402803304,2402803304"
        process_ops-lacpd: "183624,2460,100590,0,2402803254,2402803254"
        process_ops-ledd: "39172,3512,220,0,2402803043,2402803043"
        process_ops-pmd: "39636,4140,15843270,0,2402802553,2402802553"
        process_ops-portd: "35928,9592,34080,0,2402803334,2402803334"
        process_ops-powerd: "39168,3716,235910,0,2402803043,2402803043"
        process_ops-switchd: "513424,83764,135106060,0,2402803363,2402803363"
        process_ops-sysd: "43788,4388,310,0,2402803043,2402803043"
        process_ops-tempd: "39172,3692,189660,0,2402803043,2402803043"
        process_ops-vland: "38780,12356,380,0,2402803284,2402803284"
        process_ops-zebra: "39632,2880,20,0,2402803154,2402803154"
        process_ops_aaautilspamcfg: "100124,10656,804480,0,2402800872,2402800872"
        process_ops_mgmtintfcfg: "107624,14448,833260,0,2402800352,2402800352"
        process_ovsdb-server: "46612,20844,54329920,0,2402803474,2402803474"
        __proto__: Object
        __proto__: Object
        status: Object
        auto_provisioning_status: Object
        __proto__: Object
        boot_time: 0
        bufmon_info: Object
        __proto__: Object
        db_version: ""
        management_mac: "48:0f:cf:af:d1:32"
        mgmt_intf_status: Object
        default_gateway: "15.108.28.50"
        hostname: "alswitch5"
        ip: "15.108.30.248"
        link_state: "UP"
        subnet_mask: "22"
        __proto__: Object
        software_info: Object
        __proto__: Object
        status: Object
        __proto__: Object
        switch_version: "0.1.0 (Build: developer_image)"
        system_mac: "48:0f:cf:af:d1:33"


        <Box direction="row flex1">
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
                widths={{label: '130px', value: '70px', chart: '100px'}}
                metrics={[
                  { label: 'CPU Load:', metric: this.systemMetrics[0] },
                  { label: 'Memory Used:', metric: this.systemMetrics[1] },
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
                widths={{label: '130px', value: '70px', chart: '100px'}}
                metrics={[
                  { label: 'Interface 11:', metric: this.networkMetrics[0] },
                  { label: 'Interface 48:', metric: this.networkMetrics[1] },
                  { label: 'Interface 2:', metric: this.networkMetrics[2] },
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
        <Box className="flex1 pageBox">
          Big Chart
        </Box>
      </Box>
      */}
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
