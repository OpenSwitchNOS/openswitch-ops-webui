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
import { Link } from 'react-router';
import { connect } from 'react-redux';
import Sidebar from 'grommet/components/Sidebar';
import Header from 'grommet/components/Header';
import Footer from 'grommet/components/Footer';
import Title from 'grommet/components/Title';
// import Logo from './Logo'; // './HPELogo';
import Menu from 'grommet/components/Menu';
import Anchor from 'grommet/components/Anchor';
import CloseIcon from 'grommet/components/icons/base/Close';
import { t } from 'i18n/lookup.js';
import LogoutIcon from 'grommet/components/icons/base/Logout';
import App from 'grommet/components/App';
import Box from 'grommet/components/Box';
import Form from 'grommet/components/Form';
import FormField from 'grommet/components/FormField';
import FormFields from 'grommet/components/FormFields';
import Button from 'grommet/components/Button';
import Table from 'grommet/components/Table';
import RadioButton from 'grommet/components/RadioButton';
import CheckBox from 'grommet/components/CheckBox';
import Calendar from 'grommet/components/Calendar';
import SearchInput from 'grommet/components/SearchInput';

class DemoFormPage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    demo: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = { inputText: '' };
  }

  _onSubmit = () => {
    alert('Submit!');
  }

  _onChange = (inputText) => {
    this.setState({ inputText });
  }

  render() {
    const p = 'pre';
    return (
      <Form onSubmit={this._onSubmit} compact>
        <Header>
          <h1>Edit</h1>
        </Header>
        <FormFields>
          <fieldset>
            <legend>First section</legend>
            <FormField label="Item 1" htmlFor={p + "item1"} help="something helpful">
              <input id={p + "item1"} name="item-1" type="text" onChange={this._onChange} />
            </FormField>
            <FormField>
              <CheckBox id={p + "item2"} name="item-2" label="Item 2"
                  onChange={this._onChange} />
            </FormField>
            <FormField>
              <CheckBox id={p + "item3"} name="item-3" label="Item 3" toggle={true}
                  onChange={this._onChange} />
            </FormField>
            <FormField label="Item 4">
              <RadioButton id={p + "item4-1"} name="item-4" label="first"
                  onChange={this._onChange} />
              <RadioButton id={p + "item4-2"} name="item-4" label="second"
                  onChange={this._onChange} />
            </FormField>
            <FormField label="Item 5" htmlFor={p + "item5"}
                error="something's wrong">
              <textarea id={p + "item5"} name="item-5"></textarea>
            </FormField>
            <FormField label="Item 6" htmlFor={p + "item6"}>
              <SearchInput id={p + "item6"} name="item-6"
                  value={this.state.inputText}
                  onChange={this._onChange} />
            </FormField>
            <FormField label="Item 7" htmlFor={p + "item7"}
                help={<a>learn more ...</a>}>
              <select id={p + "item7"} name="item-7">
                <option>first</option>
                <option>second</option>
                <option>third</option>
              </select>
            </FormField>
            <FormField label="Item 8" htmlFor={p + "item8"}>
              <Calendar id={p + "item8"} name="item-8"
                  value={this.state.calendarDate}
                  onChange={this._onCalendarChange} />
            </FormField>
          </fieldset>
          <fieldset>
            <legend>Another section</legend>
            <p>Some informational text.</p>
            <FormField label="Item 9">
              <Table selectable={true} defaultSelection={0}>
                <tbody>
                  <tr>
                    <td>first</td>
                    <td>123</td>
                  </tr>
                  <tr>
                    <td>second</td>
                    <td>456</td>
                  </tr>
                  <tr>
                    <td>third</td>
                    <td>789</td>
                  </tr>
                </tbody>
              </Table>
            </FormField>
            <FormField label="Item 10" htmlFor={p + "item10"}>
              <input id={p + "item10"} name="item-10" type="number"
                  min="1" max="20" step="1" defaultValue="10" />
            </FormField>
            <FormField label="Item 11" htmlFor={p + "item11"} help={this.state.rangeValue}>
              <input id={p + "item11"} name="item-11" type="range"
                  min="1" max="20" defaultValue="10"
                  onChange={this._onChangeRange}/>
            </FormField>
          </fieldset>
        </FormFields>
        <Footer pad={{vertical: 'medium'}}>
          <Menu direction="row">
            <Button label="OK" primary={true} strong={true} onClick={this._onClose} />
            <Button label="OK" strong={true} onClick={this._onClose} />
          </Menu>
        </Footer>
      </Form>
    );
  }

}

const select = (state) => ({ demo: state.demo });

export default connect(select)(DemoFormPage);
