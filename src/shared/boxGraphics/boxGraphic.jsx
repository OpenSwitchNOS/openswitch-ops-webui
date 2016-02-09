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

import './boxGraphic.scss';

import React, { PropTypes, Component } from 'react';
import classNames from 'classnames';

const PREFIX = 'bxGfx_';

export default class BoxGraphic extends Component {

  static propTypes = {
    children: PropTypes.node,
    onSelect: PropTypes.func,
    select: PropTypes.arrayOf(PropTypes.string),
  };

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  _onClick = (e) => {
    if (this.props.onSelect) {
      const id = e.target.id;
      if (id.startsWith(PREFIX)) {
        const inf = id.substring(PREFIX.length);
        this.props.onSelect(inf);
      }
    }
  };

  render() {
    const adminOffCls = classNames(
      'adminOff',
      // { [`${PREFIX}3`]: true },
    );

    const linkOnCls = classNames(
      'linkOn',
      // { [`${PREFIX}2`]: true },
    );

    let selectedCls = null;
    if (this.props.select) {
      selectedCls = classNames(
        'selected',
        this.props.select.map( k => `${PREFIX}${k}` ),
      );
    }

    return (
      <div className="boxGraphic" onClick={this._onClick}>
        <div className={selectedCls}>
          <div className={adminOffCls}>
            <div className={linkOnCls}>
              {this.props.children}
            </div>
          </div>
        </div>
      </div>
    );
  }

}
