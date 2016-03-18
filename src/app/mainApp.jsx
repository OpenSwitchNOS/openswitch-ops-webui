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
import Breadcrumbs from 'react-breadcrumbs';
import ReactCSSTG from 'react-addons-css-transition-group';
import { connect } from 'react-redux';

import App from 'grommet/components/App';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Split from 'grommet/components/Split';
import Box from 'grommet/components/Box';
import Menu from 'grommet/components/Menu';
import NotificationIcon from 'grommet/components/icons/base/Notification';
import Anchor from 'grommet/components/Anchor';
import CloseIcon from 'grommet/components/icons/base/Close';
import EditIcon from 'grommet/components/icons/base/Edit';
import NextIcon from 'grommet/components/icons/base/Next';

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
    guide: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    nav: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    routeToLink: PropTypes.object.isRequired,
    routes: PropTypes.array.isRequired,
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

  _onLoginSubmit = () => {
    this.props.actions.auth.login();
  };

  render() {
    // FIXME: this.props.syslog.numUnread;
    // data retieved from this.props.collector.?
    const numSyslog = this.props.collector.overview.log.numAdded;

    // When we assign the name to the route we do a 'navt' lookup, so '/' gets
    // converted to '~/~'.
    const breadcrumbs = (
      <Breadcrumbs
          excludes={['~/~']}
          routes={this.props.routes}
          params={this.props.params} />
    );

    const pageHdr = (
      <Header justify="between" pad={{horizontal: 'medium'}}>
        <Title>
          {this.props.nav.paneActive ? null :
            <a onClick={this._onPageNavClicked}><NextIcon /></a>
          }
          {breadcrumbs}
        </Title>
        <Menu direction="row" responsive={false}>
          {this.props.toolbar.component}
          <a href="#/log">
            <NotificationIcon/><small>&nbsp;{numSyslog}</small>
          </a>
        </Menu>
      </Header>
    );

    const page = (
      <Box id="pageContent" className="flex1 pLeft pRight pBottom">
        {this.props.children}
      </Box>
    );

    const guide = !this.props.guide.component ? null : (
      <Box key="guideKey" className="guide">

        <ReactCSSTG
            transitionName="slideInColumn"
            transitionAppear
            transitionAppearTimeout={500}
            transitionEnterTimeout={500}
            transitionLeaveTimeout={500}>

          <div key="guideContentKey">
            <Header tag="h4" direction="row" pad={{horizontal: 'small'}}
                justify="between">
              <Menu direction="row" responsive={false}>
                <Title>Quick Guide</Title>
              </Menu>
              <Menu direction="row" responsive={false}>
                <Anchor onClick={this.props.actions.guide.hide}>
                  <CloseIcon />
                </Anchor>
              </Menu>
            </Header>
            <Box pad={{horizontal: 'small'}}>
              <b>Setup the Management Interface</b>
              <br/>
              <ul>
                <li>Navigate to the page:</li>
                <Anchor primary href="#/interface">interface</Anchor>
                <li>Select the interface in the table.</li>
                <li>Click the edit icon:</li>
                <EditIcon/>
                <li>Configure the IP from within the <b>Edit</b> slide-in pane</li>
                <li><b>Deploy</b> the modification.</li>
                <li>Click the <b>Restart</b> from within the confirmation dialog.</li>
                <li><i>Switch will need to be restarted.</i></li>
              </ul>
            </Box>
          </div>

        </ReactCSSTG>

      </Box>
    );

    // The only reason we pass in the location to the NavSideBar is so that
    // it will rerender when we select a navigation item (and show the new
    // active item).
    const nav = !this.props.nav.paneActive ? null :
      <NavSideBar location={this.props.location} actions={this.props.actions}/>;

    // Split will only show the priority column on small screens, we make this
    // the first (left) column because we want to be able to show the navigation
    // column on small screens. When we remove the first (left) column, the
    // page column will be the "new" left column and it will be shown. make
    // sure to completely toggle the first (left) column.

    const splitContent = (
      <Split
          flex="right"
          onResponsive={this._onNavSplitResponsive}
          priority="left">

        {nav}

        <Box responsive={false} direction="row">
          <Box id="page" className="flex1">
            {pageHdr}
            {guide}
            {page}
          </Box>
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
  guide: store.guide,
});

export default connect(select)(MainApp);
