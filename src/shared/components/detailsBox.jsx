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
import ReactCSSTG from 'react-addons-css-transition-group';
import Box from 'grommet/components/Box';


export default class DetailsBox extends Component {

  static propTypes = {
    children: PropTypes.node,
  };

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Box className="pageBox">
        <ReactCSSTG
            transitionName="slideInColumn"
            transitionAppear
            transitionAppearTimeout={500}
            transitionEnterTimeout={500}
            transitionLeaveTimeout={500}>
          <div>
            {this.props.children}
          </div>
        </ReactCSSTG>
      </Box>
    );
  }

}
