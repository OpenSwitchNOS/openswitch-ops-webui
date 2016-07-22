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

// Navigiation side bar for the top-level UI.

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { orderForGroup } from './navGroups.js';
import { t, navt } from 'i18n/lookup.js';

import Sidebar from 'grommet/components/Sidebar';
import Header from 'grommet/components/Header';
import Footer from 'grommet/components/Footer';
import Title from 'grommet/components/Title';
import Menu from 'grommet/components/Menu';
import Anchor from 'grommet/components/Anchor';
import Box from 'grommet/components/Box';
import CloseIcon from 'grommet/components/icons/base/Close';
import UserSettingsIcon from 'grommet/components/icons/base/UserSettings';
import HelpIcon from 'grommet/components/icons/base/Help';
import WorldIcon from 'grommet/components/icons/base/Language';

import PasswordChange from './passwordChange.jsx';
import StatusLayer from 'statusLayer.jsx';


class NavSideBar extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    auth: PropTypes.object.isRequired,
    collector: PropTypes.object.isRequired,
    guides: PropTypes.array.isRequired,
    links: PropTypes.object.isRequired,
    nav: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired,
  };

  // Create a flatten navgiation list based on the navigation model. The list
  // is sorted based on the 'order' value for each group and/or item.

  static mkOrderedNavItemTree(model, parent) {
    const levelItems = [];

    Object.getOwnPropertyNames(model).forEach(key => {
      const m = model[key];
      const link = m.link;
      const order = (link && link.order) || orderForGroup(key);
      const route = m.route;
      const lvlItem = { key, order, route, link };

      levelItems.push(lvlItem);
      if (!link) {
        NavSideBar.mkOrderedNavItemTree(m, lvlItem);
      }
    });

    levelItems.sort((i1, i2) => { return i1.order - i2.order; });
    parent.items = levelItems;
    return parent;
  }

  // Creates the navgiation groups and Links based on the ordered navigation
  // items created earlier.

  static mkNavItems(navItems, items) {
    if (navItems) {
      navItems.forEach(navItem => {
        if (!navItem.link) {
          items.push(
            <Header pad={{horizontal: 'medium'}} key={navItem.key}>
              <Title>{navt(navItem.key)}</Title>
            </Header>
          );
          items.concat(NavSideBar.mkNavItems(navItem.items, items));
        } else {
          items.push(
            <Link
                key={navItem.key}
                to={navItem.route}
                activeClassName="active"
            >
              {navt(navItem.key)}
            </Link>
          );
        }
      });
    }
  }

  // We only want to create the navigation list once (it is not runtime
  // configurable). We store it in the component's object but not in the
  // state object.

  constructor(props) {
    super(props);
    this.state = {};
    const tree = NavSideBar.mkOrderedNavItemTree(this.props.links, {});
    this.items = [];
    NavSideBar.mkNavItems(tree.items, this.items);
  }

  _onClose = () => {
    this.props.actions.nav.hidePane();
  };

  _mkExtLinks = () => {
    if (!this.props.settings.extLinks) { return []; }
    return this.props.settings.extLinks.map( lnk => {
      return (
        <Anchor target="_blank" key={lnk.key} href={lnk.href}>
          {t(lnk.key)}
        </Anchor>
      );
    });
  };

  _mkGuides = () => {
    return this.props.guides.map( (g, i) => {
      const clk = () => this.props.actions.guide.show(g.COMPONENT);
      return <Anchor key={`guide${i}`} onClick={clk}>{g.MENU_TEXT}</Anchor>;
    });
  };

  _onClosePwChange = () => {
    this.setState({chpw: false});
  };

  _onPwChange = () => {
    this.setState({chpw: true});
  };

 _onPwChangeSubmit= (changePw) => {
   this.props.actions.auth.changePassword(changePw);
   this._onClosePwChange();
 };

  render() {

    const auth = this.props.auth.asyncStatus;
    const chpwInfoLayer = !auth.lastError ? null :
      <StatusLayer
          value="warning"
          title={t('changePwFailed')}
          onClose={() => this.props.actions.auth.clearError()}>
        {t('retryChPw')}
      </StatusLayer>;

    const changePw = this.state.chpw ?
      <PasswordChange
          onClose={this._onClosePwChange}
          onSubmit={this._onPwChangeSubmit}
      /> : null;
    return (

      <Sidebar colorIndex="neutral-3" separator="right">
      {chpwInfoLayer}
        <Header tag="h4" justify="between" pad={{horizontal: 'medium'}}>
          <Title onClick={this._onClose}>
            {this.props.settings.navLogo}
            {this.props.settings.logoText}
          </Title>
          <Menu responsive={false}>
            <Anchor onClick={this._onClose}>
              <CloseIcon />
            </Anchor>
          </Menu>
        </Header>
        <Box>
          <Box pad={{horizontal: 'medium', vertical: 'small'}}>
            <div><b>{t('hostname')}</b></div>
            <div>{this.props.collector.hostname}</div>
            <br/>
            <div><b>{t('product')}</b></div>
            <div>{this.props.collector.product}</div>
          </Box>
          <br/>
          <Menu primary>
            {this.items}
          </Menu>
          <br/>
        </Box>
        <Footer pad={{vertical: 'small'}} direction="column" align="start">
          <Box align="center" direction="row" pad={{horizontal: 'small'}}>
            <Menu icon={<HelpIcon />} dropAlign={{bottom: 'bottom'}}>
              {this._mkGuides()}
            </Menu>
            <span>{t('guides')}</span>
          </Box>
          <Box align="center" direction="row" pad={{horizontal: 'small'}}>
            <Menu icon={<WorldIcon />} dropAlign={{bottom: 'bottom'}}>
              {this._mkExtLinks()}
            </Menu>
            <span>{t('links')}</span>
          </Box>
          <Box pad={{vertical: 'small'}}/>
          <Box align="center" direction="row" pad={{horizontal: 'small'}}>
            <Menu icon={<UserSettingsIcon />} dropAlign={{bottom: 'bottom'}}>
              <Anchor onClick={this.props.actions.auth.logout}>
                {t('logout')}
              </Anchor>
              <Anchor onClick={this._onPwChange}>{t('changePw')}</Anchor>
            </Menu>
            <span>{this.props.auth.username}</span>
            {changePw}
          </Box>
        </Footer>
      </Sidebar>
    );
  }

}

const select = (store) => ({
  auth: store.auth,
  links: store.links,
  nav: store.nav,
  guides: store.guides,
  collector: store.collector,
  settings: store.settings,
});

export default connect(select)(NavSideBar);
