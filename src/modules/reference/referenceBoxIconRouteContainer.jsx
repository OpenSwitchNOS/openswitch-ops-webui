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
import BoxContainer from 'boxContainer.jsx';
import BoxIcon from 'boxIcon.jsx';

class ReferenceToolbarRouteContainer extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    reference: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  onFilterChange = (filterText) => {
    this.setState({ filterText });
  }

  onClick = () => {
    alert('You clicked!');
  }

  render() {
    return (
      <BoxContainer page col pad2x>

        <BoxContainer panel marginBottom2x pad>
          <h3>Example BoxIcons</h3>
        </BoxContainer>

        <BoxContainer panel pad>

          <BoxIcon fa="gear" onClick={this.onClick}/>
          <span>Some Text Inbetween</span>
          <BoxIcon fa="star" onClick={this.onClick}/>
          <span>Some Text Inbetween</span>
          <BoxIcon disabled fa="star" onClick={this.onClick}/>

        </BoxContainer>

      </BoxContainer>
    );
  }

}

function select(state) {
  return {
    reference: state.reference,
  };
}

export default connect(select)(ReferenceToolbarRouteContainer);
