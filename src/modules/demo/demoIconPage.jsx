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

import Box from 'grommet/components/Box';
import BrandLogo from 'brandLogo.jsx';
import Section from 'grommet/components/Section';
import EditIcon from 'grommet/components/icons/base/Edit';
import SpanStatus from 'spanStatus.jsx';
import TimeAgo from 'react-timeago';

class DemoIconPage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    demo: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {};
    this.pad = {horizontal: 'small', vertical: 'small'};
  }

  render() {
    return (
      <Box>
        <Section pad={this.pad} className="pageBox" colorIndex="neutral-4">
          <BrandLogo size="small" lightColor="grey" />
          <BrandLogo size="medium" lightColor="grey" />
          <BrandLogo size="large" lightColor="grey" />
        </Section>
        <Section className="pageBox" colorIndex="neutral-1">
          <EditIcon />
        </Section>
        <Section className="pageBox" colorIndex="neutral-2">
          <EditIcon large />
        </Section>
        <Section className="pageBox" colorIndex="neutral-1">
          <EditIcon className="tiny" />
        </Section>
        <Section pad={this.pad} className="pageBox" >
          <SpanStatus value="ok">
            SpanStatus with value="ok"
          </SpanStatus>
          <br/>
          <SpanStatus value="critical">
            SpanStatus with value="critical"
          </SpanStatus>
          <br/>
          <SpanStatus value="warning">
            SpanStatus with value="warning"
          </SpanStatus>
          <br/>
          <SpanStatus value="unknown">
            SpanStatus with value="unknown"
          </SpanStatus>
          <br/>
          <SpanStatus value="disabled">
            SpanStatus with value="disabled"
          </SpanStatus>
          <br/>
          <SpanStatus value="label">
            SpanStatus with value="label"
          </SpanStatus>
          <br/>
          <SpanStatus disabled value="warning">
            SpanStatus disabled with value="warning"
          </SpanStatus>
          <br/>
          <SpanStatus value="ok">
            Loaded the page&nbsp;<TimeAgo date={new Date()}/>
          </SpanStatus>
        </Section>
      </Box>
    );
  }

}

const select = (store) => ({ demo: store.demo });

export default connect(select)(DemoIconPage);
