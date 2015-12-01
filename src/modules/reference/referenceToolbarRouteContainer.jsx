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
import Toolbar from 'toolbar.jsx';
import Button from 'button.jsx';
import CheckBox from 'checkBox.jsx';
import RadioButton from 'radioButton.jsx';
import Menu from 'menu.jsx';
import SearchInput from 'searchInput.jsx';


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
          <h3>Example Toolbars</h3>
        </BoxContainer>

        <BoxContainer panel pad>

          <Toolbar borderBottom spaceBetween>
            <span>
              <BoxIcon fa="star"/>
              <BoxIcon fa="gear"/>
            </span>
            <span className="title textAlignCenter flexItem1">
              Flex1
            </span>
            <span className="flexItem1">
              <SearchInput
                  value={this.state.filterText}
                  placeHolder="Filter"
                  onChange={this.onFilterChange}
              />
            </span>
            <span>
              <Menu dropAlign={{right: 'right'}}>
                <a onClick={this.onClick}>Menu Item</a>
              </Menu>
            </span>
          </Toolbar>

          <p/>

          <Toolbar borderBottom spaceBetween>
            <BoxIcon large fa="bars" onClick={this.onClick}/>
            <BoxIcon disabled large fa="arrow-up" onClick={this.onClick}/>
            <BoxIcon fa="arrow-up" onClick={this.onClick}/>
            <span>
              <SearchInput
                  value={this.state.filterText}
                  placeHolder="Filter"
                  onChange={this.onFilterChange}
              />
            </span>
            <span>
              <Button primary label="Primary" onClick={this.onClick}/>
              &nbsp;
              <Button label="Default" onClick={this.onClick}/>
            </span>
            <Menu dropAlign={{right: 'right'}}>
              <a onClick={this.onClick}>Menu Item</a>
            </Menu>
          </Toolbar>

          <p/>

          <Toolbar borderBottom spaceBetween>
            <span>
              <RadioButton id="rbc1" name="choice" label="Choice 1" />
              <RadioButton id="rbc2" name="choice" label="Choice 2" />
              <RadioButton id="rbc3" disabled name="choice" label="Choice 3" />
            </span>
            <CheckBox id="cb1" toggle label="Toggle" />
            <CheckBox id="cb2" disabled toggle label="Disabled Toggle" />
          </Toolbar>

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
