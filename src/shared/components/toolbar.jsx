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
import Box from 'grommet/components/Box';

const HEIGHT = 52;

export default class Toolbar extends Component {

  static propTypes = {
    children: PropTypes.node,
    width: PropTypes.number,
  };

  static height() { return HEIGHT; }

  constructor(props) {
    super(props);
  }

  render() {
    const style = {height: HEIGHT, width: this.props.width};
    return (
      <div className="toolbar" style={style}>
        <Box {...this.props}
            direction="row"
            responsive={false}
            justify="between">
          {this.props.children}
        </Box>
      </div>
    );
  }

}
