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

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { orderForGroup } from './navGroups.js';
import { t } from 'i18n/lookup.js';

class NavPane extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    links: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = { items: [] };
  }

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
        NavPane.mkOrderedNavItemTree(m, lvlItem);
      }
    });

    levelItems.sort((i1, i2) => { return i1.order - i2.order; });
    parent.items = levelItems;
    return parent;
  }

  static mkNavItems(navItems, items) {
    if (navItems) {
      navItems.forEach(navItem => {
        if (!navItem.link) {
          if (items.length > 0) {
            items.push(<hr key={`${navItem.key}-hr`}/>);
          }
          items.push(
            <div className="group" key={navItem.key}>{t(navItem.key)}</div>
          );
          items.concat(NavPane.mkNavItems(navItem.items, items));
        } else {
          items.push(
            <div key={navItem.key} className="item">
              <Link
                  to={navItem.route}
                  activeClassName="active"
              >
                {t(navItem.key)}
              </Link>
            </div>
          );
        }
      });
    }
  }

  componentWillMount() {
    const tree = NavPane.mkOrderedNavItemTree(this.props.links, {});
    const items = [];
    NavPane.mkNavItems(tree.items, items);
    this.setState({ items });
  }

  render() {
    return (
      <div>
        {this.state.items}
      </div>
    );
  }

}

function select(state) {
  return {
    links: state.links
  };
}

export default connect(select)(NavPane);
