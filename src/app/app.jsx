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

import './app.scss';
import 'font-awesome-webpack';

import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import NavPane from './navPane.jsx';
import Logo from 'logo.svg';
import { Link } from 'react-router';
import Menu from 'menu.jsx';
import BoxIcon from 'boxIcon.jsx';
import Toolbar from 'toolbar.jsx';
import { t } from 'i18n/lookup.js';


const MD_MEDIA = 'only screen and (min-width: 768px)';
const LG_MEDIA = 'only screen and (min-width: 1200px)';


class App extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    children: PropTypes.node,
    nav: PropTypes.object,
    syslog: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  onNavPaneToggle = () => {
    const b = !this.props.nav.showPane;
    this.props.actions.nav[b ? 'showPane' : 'hidePane']();
  }

  componentDidMount() {
    this.mdMediaMonitor = window.matchMedia(MD_MEDIA);
    this.mdMediaMonitor.addListener(this.onMdMediaMatch);

    this.lgMediaMonitor = window.matchMedia(LG_MEDIA);
    this.lgMediaMonitor.addListener(this.onLgMediaMatch);
  }

  componentWillUnmount() {
    this.lgMediaMonitor.removeListener(this.onMdMediaMatch);
    this.mdMediaMonitor.removeListener(this.onLgMediaMatch);
  }

  onMdMediaMatch = (e) => {
    if (e.matches) {
      this.props.actions.screen.medium();
      if (!this.props.nav.showPane) {
        this.props.actions.nav.showPane();
      }
    } else {
      this.props.actions.screen.small();
      if (this.props.nav.showPane) {
        this.props.actions.nav.hidePane();
      }
    }
  }

  onLgMediaMatch = (e) => {
    if (e.matches) {
      this.props.actions.screen.large();
    } else {
      this.props.actions.screen.medium();
    }
  }

  onLogout = () => {
    alert('Logout');
  }

  render() {
    const showNavPane = this.props.nav.showPane;

    const navPaneCls = classNames( { navPaneOpen: showNavPane } );
    const pageCls = classNames( { navPaneOpen: showNavPane } );

    const toggleFa = showNavPane ? 'chevron-left' : 'chevron-right';
    const toolbarToggle = (
      <span>
        <BoxIcon fa={toggleFa} onClick={this.onNavPaneToggle}/>
      </span>
    );

    const toolbarLogo = (
      <span>
        <img className="svg mdOnly" src={Logo} height="32" />
      </span>
    );

    const toolbarLogoText = (
      <span className="lgOnly title">
        {t('openSwitch')}
      </span>
    );

    const toolbarInfo = (
      <span className="flexItem3 textAlignCenter">
        <span>
          <b>{t('hostname')}:&nbsp;</b>
          HOSTNAME_HERE
        </span>
        <span className="lgOnly">
          &nbsp;&nbsp;&nbsp;<b>{t('serialNo')}:&nbsp;</b>
          SERIAL_NO_HERE
        </span>
      </span>
    );

    const syslogData = this.props.syslog;
    const syslogUnread = syslogData.lastRead < syslogData.lastUpdate;
    const toolbarSyslog = (
      <span className="flexItem1">
        <Link key="syslog" to="/syslog">
          <span>
            <b className="mdOnly">{t('syslog')}:&nbsp;</b>
            {syslogUnread ? '999' : '0'}
          </span>
        </Link>
      </span>
    );

    // Note: you can't use "Link" in a menu popup because it is not within
    // the context of the route (I think)...anyways it doesn't work.
    const toolbarSystemMenu = (
      <span className="textAlignRight">
        <span className="mdOnly">
          <b>{t('user')}:&nbsp;</b>
          USER_NAME_HERE
          &nbsp;&nbsp;
        </span>
        <Menu
            dropAlign={{right: 'right'}}
        >
          <a onClick={this.onLogout}>{t('logout')}</a>
        </Menu>
      </span>
    );

    // NO WORKY in above menu: icon=<BoxIcon fa="gear"/>

    return (
      <div id="app">
        <Toolbar id="appNavBar" spaceBetween>
          {toolbarToggle}
          {toolbarLogo}
          {toolbarLogoText}
          {toolbarInfo}
          {toolbarSyslog}
          {toolbarSystemMenu}
        </Toolbar>

        <div id="appNavPane" className={navPaneCls}>
          <NavPane {...this.props} />
        </div>

        <div id="appPage" className={pageCls}>
          {this.props.children}
        </div>
      </div>
    );
  }

}

function select(state) {
  return {
    nav: state.nav,
    syslog: state.syslog
  };
}

export default connect(select)(App);
