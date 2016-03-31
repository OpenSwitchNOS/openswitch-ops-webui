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
import { t } from 'i18n/lookup.js';

import Box from 'grommet/components/Box';
import Anchor from 'grommet/components/Anchor';
import RefreshIcon from 'grommet/components/icons/base/Refresh';
import MetricChart from 'metricChart.jsx';


class MonitorInterfaceMetric extends Component {

  static propTypes = {
    collector: PropTypes.object.isRequired,
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {};
    this.pad = {horizontal: 'small', vertical: 'small'};
  }

  render() {
    const id = this.props.params.id;
    const metrics = this.props.collector.interfaceMetrics[id];

    let content = null;
    if (!metrics || metrics.length === 0) {
      content = (
        <div style={{textAlign: 'center'}}>
          <RefreshIcon className="spin"/>
          &nbsp;&nbsp;
          {t('loading')}
        </div>
      );
    } else {
      content = metrics.map(m => {
        return (
          <div key={m.getName()}>
            <b>{m.getName()}</b>
            <MetricChart size="large" metric={m}/>
            <br/>
          </div>
        );
      });
    }

    const infHref = `#/interface/${this.props.params.id}`;

    return (
      <Box pad={this.pad} className="pageBox">
        <span>
          <large><b>{t('utilization')}</b></large>
          &nbsp;&nbsp;&nbsp;
          <Anchor href={infHref}>
              {`(${t('interfaceDetails')})`}
          </Anchor>
        </span>
        <br/>
        {content}
      </Box>
    );
  }

}

function select(store) {
  return {
    collector: store.collector,
  };
}

export default connect(select)(MonitorInterfaceMetric);
