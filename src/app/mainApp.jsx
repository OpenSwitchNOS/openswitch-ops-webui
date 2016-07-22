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
import { connect } from 'react-redux';
import { t } from 'i18n/lookup.js';

import App from 'grommet/components/App';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Split from 'grommet/components/Split';
import Box from 'grommet/components/Box';
import Menu from 'grommet/components/Menu';
// TODO: import NotificationIcon from 'grommet/components/icons/base/Notification';
import Anchor from 'grommet/components/Anchor';
import CloseIcon from 'grommet/components/icons/base/Close';
import NextIcon from 'grommet/components/icons/base/Next';

import LoginLayer from 'loginLayer.jsx';
import StatusLayer from 'statusLayer.jsx';

import NavSideBar from './navSideBar.jsx';


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
    settings: PropTypes.object.isRequired,
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
          this._onAutoActionTimer, this.props.settings.AUTO_ACTIONS_INTERVAL
        );
      }
    }
    if (this.props.nav.autoHide) {
      if (newProps.location !== this.props.location ||
          newProps.guide.component !== this.props.guide.component) {
        this.props.actions.nav.hidePane();
      }
    }
  }

  // Called when a responsive change happens on the main Split component.
  // This will result in 'single' or 'multiple' mode.
  _onNavSplitResponsive = (mode) => {
    this.props.actions.nav.autoHide(mode === 'single');
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

  _onLoginSubmit = (data) => {
    this.props.actions.auth.login(data);
  };

  _mkPageHdr = () => {
    // For the breadcrumb, when we assign the name to the route we do a 'navt'
    // lookup, so '/' gets converted to '~/~'.
    const openNav = this.props.nav.paneActive ? null :
      <a onClick={this._onPageNavClicked}><NextIcon /></a>;

    // TODO: log page header
    // const notifLink = '#/log';
    // const notifCount = 3; // TODO: implement me

    return (
      <Header
          justify="between"
          pad={{horizontal: 'medium'}}
          separator="bottom"
      >
        <Menu direction="row" responsive={false}>
          {openNav}
          <Breadcrumbs excludes={['~/~']}
              routes={this.props.routes}
              params={this.props.params} />
        </Menu>
        <Menu direction="row" responsive={false}>
          {this.props.toolbar.component}
          {/*<a href={notifLink}>
            <NotificationIcon className="mHalf"/>
            <small>{notifCount}</small>
          </a>*/}
        </Menu>
      </Header>
    );
  };

  _mkGuide = () => {
    return (
      <Box className="guide">
        <div>
          <Header
              tag="h4"
              direction="row"
              pad={{horizontal: 'small'}}
              justify="between">
            <Menu direction="row" responsive={false}>
              <Title>{t('quickGuide')}</Title>
            </Menu>
            <Menu direction="row" responsive={false}>
              <Anchor onClick={this.props.actions.guide.hide}>
                <CloseIcon />
              </Anchor>
            </Menu>
          </Header>
          {this.props.guide.component}
        </div>
      </Box>
    );
  };

  render() {

    // The only reason we pass in the location to the NavSideBar is so that
    // it will rerender when we select a navigation item (and show the new
    // active item).
    const nav = !this.props.nav.paneActive ? null :
      <NavSideBar location={this.props.location} actions={this.props.actions}/>;

    const page = (
      <Box id="pageContent" className="flex1 pLeft pRight pBottom">
        {this.props.children}
      </Box>
    );

    // Show the "quick guide" if one has been set.
    const guide = !this.props.guide.component ? null : this._mkGuide();

    const auth = this.props.auth.asyncStatus;
    const infoLayer = !auth.lastError ? null :
      <StatusLayer
          value="warning"
          title={t('loginFailed')}
          onClose={() => this.props.actions.auth.clearError()}>
        {auth.lastError === 'rootNotAllowed' ? t('rootNotAllowed') :
          t('reenterUserPwd')}
      </StatusLayer>;

    // Split will only show the priority column on small screens, we make this
    // the first (left) column because we want to be able to show the navigation
    // column on small screens. When we remove the first (left) column, the
    // page column will be the "new" left column and it will be shown. make
    // sure to completely toggle the first (left) column.

    return (
      <App centered={false}>
        {infoLayer}
        {this.props.auth.isLoggedIn || this.props.settings.disableLogin
          ? <Split
              flex="right"
              onResponsive={this._onNavSplitResponsive}
              priority="left"
            >
              {nav}
              <Box responsive={false} direction="row">
                <Box id="page" className="flex1">
                  {this._mkPageHdr()}
                  {guide}
                  {page}
                </Box>
              </Box>
            </Split>
          : <LoginLayer
              logo={this.props.settings.loginLogo}
              logoText={this.props.settings.logoText}
              onSubmit={auth.inProgress ? null : this._onLoginSubmit}/>
        }
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
  settings: store.settings,
});

export default connect(select)(MainApp);
