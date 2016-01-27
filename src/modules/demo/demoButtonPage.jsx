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
import Button from 'grommet/components/Button';

class DemoButtonPage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    demo: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  _onClick = () => {
    alert('Clicked me!');
  };

  render() {
    return (
      <Box pad={{vertical: 'large', horizontal: 'large'}} className="pageBox">
        <Button onClick={this._onClick} label="Default-Active"/>
        <p/>
        <Button label="Default-Disabled"/>
        <p/>
        <Button primary onClick={this._onClick} label="Primary"/>
        <p/>
        <Button primary label="Primary-Disabled"/>
      </Box>
    );
  }

}

const select = (store) => ({ demo: store.demo });

export default connect(select)(DemoButtonPage);
