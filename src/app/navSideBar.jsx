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
import { t } from 'i18n/lookup.js';

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

import BrandLogo from 'brandLogo.jsx';

class NavSideBar extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    collector: PropTypes.object.isRequired,
    guide: PropTypes.object.isRequired,
    links: PropTypes.object.isRequired,
    nav: PropTypes.object.isRequired,
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
              <Title>{t(navItem.key)}</Title>
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
              {t(navItem.key)}
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

    // TODO: Guides net to be implemented - this will come from the build config
    this.guide = [
      { menuKey: 'configMgmtInterface', component: <div>ConfigMgmtIntf</div> },
      { menuKey: 'configVlan', component: <div>ConfigVLAN</div> },
    ];
  }

  _onClose = () => {
    this.props.actions.nav.hidePane();
  };

  _onClickGuide = (index) => {
    this.props.actions.guide.show(this.guide[index].component);
  };

  render() {
    return (
      <Sidebar colorIndex="neutral-3" fixed separator="right">
        <Header tag="h4" justify="between" pad={{horizontal: 'medium'}}>
          <Title onClick={this._onClose}>
            <BrandLogo />
            {t('openSwitch')}
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
            <div>{this.props.collector.overview.info.hostname}</div>
            <br/>
            <div><b>{t('product')}</b></div>
            <div>{this.props.collector.overview.info.product}</div>
          </Box>
          <br/>
          <Menu primary>
          {this.items}
          </Menu>
        </Box>
        <Footer pad={{vertical: 'small'}} direction="column" align="start">
          <Box align="center" direction="row" pad={{horizontal: 'small'}}>
            <Menu icon={<HelpIcon />} dropAlign={{bottom: 'bottom'}}>
              <a onClick={this._onClickGuide.bind(this, 0)}>{t(this.guide[0].menuKey)}</a>
              <a onClick={this._onClickGuide.bind(this, 1)}>{t(this.guide[1].menuKey)}</a>
            </Menu>
            <span>{t('guides')}</span>
          </Box>
          <Box align="center" direction="row" pad={{horizontal: 'small'}}>
            <Menu icon={<WorldIcon />} dropAlign={{bottom: 'bottom'}}>
              <a onClick={this.props.actions.auth.logout}>{t('logout')}</a>
            </Menu>
            <span>{t('links')}</span>
          </Box>
          <Box pad={{vertical: 'small'}}/>
          <Box align="center" direction="row" pad={{horizontal: 'small'}}>
            <Menu icon={<UserSettingsIcon />} dropAlign={{bottom: 'bottom'}}>
              <a onClick={this.props.actions.auth.logout}>{t('logout')}</a>
            </Menu>
            <span>jpowell</span>
          </Box>
        </Footer>
      </Sidebar>
    );
  }

}

const select = (store) => ({
  links: store.links,
  nav: store.nav,
  guide: store.guide,
  collector: store.collector,
});

export default connect(select)(NavSideBar);
