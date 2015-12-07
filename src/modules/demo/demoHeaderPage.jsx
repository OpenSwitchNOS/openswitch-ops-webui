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
import { t } from 'i18n/lookup.js';

import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Menu from 'grommet/components/Menu';
import CheckBox from 'grommet/components/CheckBox';
import SearchInput from 'grommet/components/SearchInput';
import NotificationIcon from 'grommet/components/icons/base/Notification';
import UserSettingsIcon from 'grommet/components/icons/base/UserSettings';
import EditIcon from 'grommet/components/icons/base/Edit';

import Toolbar from 'toolbar.jsx';
import BrandLogo from 'brandLogo.jsx';

class DemoHeaderPage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    demo: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = { search: '' };
  }

  _onClick = () => {
    alert('Do it!');
  }

  _onSearch = (s) => {
    this.setState({ search: s });
  }

  render() {

    const links = [
      <Link key="icon" to="/demoIcon" activeClassName="active">
        {t('icon')}
      </Link>,
      <Link key="color" to="/demoColor" activeClassName="active">
        {t('color')}
      </Link>,
      <Link key="header" to="/demoHeader" activeClassName="active">
        {t('header')}
      </Link>,
    ];

    const anchors = [
      <a key="icon" href="#/demoIcon">{t('icon')}</a>,
      <a key="color" href="#/demoColor">{t('color')}</a>,
      <a key="header" href="#/demoHeader">{t('header')}</a>,
    ];

    return (
      <div>

        <Header justify="between" colorIndex="neutral-3"
            pad={{horizontal: 'medium'}}>
          <Title><BrandLogo/>{t('openSwitch')}</Title>
          <Menu inline responsive={false} direction="row">
            <Menu direction="row" align="center" responsive={false}>
              {links}
            </Menu>
            <Menu icon={<NotificationIcon />}
                dropAlign={{right: 'right'}}
                dropColorIndex="neutral-4">
              {anchors}
            </Menu>
            <Menu icon={<UserSettingsIcon />}
                dropAlign={{right: 'right'}}
                dropColorIndex="neutral-2">
              {anchors}
            </Menu>
          </Menu>
        </Header>

        <p/>

        <Toolbar separator="bottom">
          <Menu direction="row" align="center" responsive={false}>
            <CheckBox id="cb1" label="" />
            <SearchInput
                placeHolder={t('search')}
                onChange={this._onSearch}
                value={this.state.search}/>
            <Title>Toolbar</Title>
          </Menu>
          <a onClick={this._onClick}><EditIcon/></a>
        </Toolbar>

      </div>
    );
  }

}

const select = (state) => ({ demo: state.demo });

export default connect(select)(DemoHeaderPage);
