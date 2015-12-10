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

import NavSideBar from './navSideBar.jsx';

class MainApp extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    children: PropTypes.node,
    location: PropTypes.object,
    nav: PropTypes.object,
    routeToLink: PropTypes.object,
    status: PropTypes.object,
    syslog: PropTypes.object,
    toolbar: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {};
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
  }

  _onPageNavClicked = () => {
    this.props.actions.nav.showPane();
  }

  _linkPathName() {
    const loc = this.props.location.pathname;
    const linkPath = this.props.routeToLink[loc];
    if (linkPath) {
      const name = [];
      const parts = linkPath.split('/');
      parts.forEach(p => {
        if (p) {
          name.push(t(p));
        }
      });
      return name.join('/');
    }
    return '/';
  }

  render() {
    // The only reason we pass in the location to the NavSideBar is so that
    // it will rerender when we select a navigation item (and show the new
    // active item).
    const nav = this.props.nav.paneActive ?
      <NavSideBar location={this.props.location} actions={this.props.actions}/>
      : null;

    const numSyslog = this.props.syslog.numUnread;

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
      <Box className="flex1" pad="small">
        {this.props.children}
      </Box>
    );

    return (
      <App centered={false}>
        <Split flex="right" onResponsive={this._onNavSplitResponsive}
            priority="left">
          {nav}
          <Box>
            {pageHdr}
            {page}
          </Box>
        </Split>
      </App>
    );
  }

}

const select = (state) => ({
  nav: state.nav,
  routeToLink: state.routeToLink,
  toolbar: state.toolbar,
  syslog: state.syslog,
});

export default connect(select)(MainApp);
