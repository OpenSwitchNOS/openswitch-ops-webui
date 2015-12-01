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


class GivenComputedAvailableSize extends Component {

  static propTypes = {
    computedAvailableHeight: PropTypes.number,
    computedAvailableWidth: PropTypes.number,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const ah = this.props.computedAvailableHeight;
    const aw = this.props.computedAvailableWidth;
    return (
      <div>
        can use the passed in props to resize itself
        <p/>
        <div>{`this.props.computedAvailableHeight = ${ah}`}</div>
        <div>{`this.props.computedAvailableWidth = ${aw}`}</div>
      </div>
    );
  }
}


class ReferenceBoxContainerRouteContainer extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    reference: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <BoxContainer page col pad2x>

        <BoxContainer panel marginBottom2x pad>
          <h3>Example BoxContainers</h3>
        </BoxContainer>

        <BoxContainer row marginBottom2x>
          <BoxContainer panel pad flex={1} marginRight2x>
            Left box
          </BoxContainer>
          <BoxContainer panel pad flex={1}>
            Right box
          </BoxContainer>
        </BoxContainer>

        <BoxContainer panel pad flex={1} computeSize>
          <GivenComputedAvailableSize/>
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

export default connect(select)(ReferenceBoxContainerRouteContainer);
