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
import Status from 'grommet/components/icons/Status';

export default class SpanStatus extends Component {

  static propTypes = {
    children: PropTypes.node,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
    size: PropTypes.string,
    space: PropTypes.bool,
    value: PropTypes.oneOf([
      'critical', 'warning', 'ok', 'disabled', 'unknown'
    ]).isRequired,
  };

  static defaultProps = {
    space: true,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const clk = this.props.onClick;
    const mainStyle = clk ? {cursor: 'pointer'} : null;
    const size = this.props.size;
    const dis = this.props.disabled;
    const sp = this.props.space ? <span>&nbsp;&nbsp;</span> : null;
    return (
      <span onClick={clk} style={mainStyle}>
        <Status size={size} value={dis ? 'unknown' : this.props.value}/>
        <span className={dis ? 'disabled' : null}>
          {sp}{this.props.children}
        </span>
      </span>
    );
  }

}
