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

// Main Application component that creates the top-level UI.

import './mainApp.scss';

import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { t } from 'i18n/lookup.js';

import App from 'grommet/components/App';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Split from 'grommet/components/Split';
import Box from 'grommet/components/Box';
import Menu from 'grommet/components/Menu';
import NotificationIcon from 'grommet/components/icons/base/Notification';

import LoginLayer from 'loginLayer.jsx';

import NavSideBar from './navSideBar.jsx';


const AUTO_ACTIONS_INTERVAL = 10000;

class MainApp extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    auth: PropTypes.object.isRequired,
    autoActions: PropTypes.object.isRequired,
    children: PropTypes.node,
    collector: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    nav: PropTypes.object.isRequired,
    routeToLink: PropTypes.object.isRequired,
    toolbar: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.autoActionsTimer = null;
    this.state = {};
  }

  _invokeAutoActions = () => {
    const aaModules = this.props.autoActions;
    Object.getOwnPropertyNames(aaModules).forEach(moduleKey => {
      const aa = aaModules[moduleKey];
      Object.getOwnPropertyNames(aa).forEach(k => { aa[k](); });
    });
  };

  _onAutoActionTimer = () => { this._invokeAutoActions(); };

  componentWillReceiveProps(newProps) {
    const wasLoggedIn = this.props.auth.isLoggedIn;
    const isLoggedIn = newProps.auth.isLoggedIn;
    if (wasLoggedIn !== isLoggedIn) {
      if (this.autoActionsTimer) { clearInterval(this.autoActionsTimer); }
      if (isLoggedIn) {
        this._invokeAutoActions();
        this.autoActionsTimer = setInterval(
          this._onAutoActionTimer, AUTO_ACTIONS_INTERVAL
        );
      }
    }
  }

  // Called when a responsive change happens on the main Split component.
  // This will result in 'single' or 'multiple' mode.
  _onNavSplitResponsive = (mode) => {
    const act = this.props.nav.paneActive;
    if (act && mode === 'single') {
      this.props.actions.nav.hidePane();
    } else if (!act && mode === 'multiple') {
      this.props.actions.nav.showPane();
    }
  };

  _onPageNavClicked = () => {
    this.props.actions.nav.showPane();
  };

  // FIXME: this is broken with /vlan/:id - use a "breadcrumb" plug in?
  _linkPathName = () => {
    const loc = this.props.location.pathname;
    const linkPath = this.props.routeToLink[loc];
    if (linkPath) {
      const name = [];
      const parts = linkPath.split('/');
      parts.forEach(p => {
        if (p) { name.push(t(p)); }
      });
      return name.join('/');
    }
    return '/';
  };

  _onLoginSubmit = () => {
    this.props.actions.auth.login();
  };

  render() {
    // The only reason we pass in the location to the NavSideBar is so that
    // it will rerender when we select a navigation item (and show the new
    // active item).
    const nav = this.props.nav.paneActive ?
      <NavSideBar location={this.props.location} actions={this.props.actions}/>
      : null;

    // FIXME: this.props.syslog.numUnread;
    // data retieved from this.props.collector.?
    const numSyslog = 99;

    const pageHdr = (
      <Header tag="h4" direction="row" pad={{horizontal: 'small'}}
          justify="between">
        <Menu direction="row" align="center" responsive={false}>
          {!this.props.nav.paneActive ?
            <Title onClick={this._onPageNavClicked}>{'>>>'}</Title>
            : null
          }
          <Title>{this._linkPathName()}</Title>
        </Menu>
        <Menu direction="row" align="center" responsive={false}>
          {this.props.toolbar.component}
          <a href="#/syslog">
            <NotificationIcon/><small>{numSyslog}</small>
          </a>
        </Menu>
      </Header>
    );

    const page = (
      <Box id="pageContent" className="flex1 pLeft pRight pBottom">
        {this.props.children}
      </Box>
    );

    const splitContent = (
      <Split flex="right" onResponsive={this._onNavSplitResponsive}
          priority="left">
        {nav}
        <Box id="page">
          {pageHdr}
          {page}
        </Box>
      </Split>
    );

    const login = <LoginLayer onSubmit={this._onLoginSubmit}/>;

    return (
      <App centered={false}>
        {this.props.auth.isLoggedIn ? splitContent : login}
      </App>
    );
  }

}

const select = (store) => ({
  auth: store.auth,
  nav: store.nav,
  routeToLink: store.routeToLink,
  toolbar: store.toolbar,
  collector: store.collector,
});

export default connect(select)(MainApp);
