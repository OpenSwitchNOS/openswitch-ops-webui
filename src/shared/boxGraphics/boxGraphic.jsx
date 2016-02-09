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

// The box graphic SCSS file is not imported here by design. Because the
// interface mappings will be different for each device, it is the resposibility
// of the specific device SCSS to also import the box graphic SCSS "after"
// defining mappings.

import React, { PropTypes, Component } from 'react';
import classNames from 'classnames';


// This value must correspond to the value defined in the SCSS file.
const INF_CLS_PREFIX = 'i_';


export default class BoxGraphic extends Component {

  static propTypes = {
    children: PropTypes.node,
    onSelect: PropTypes.func,
    select: PropTypes.arrayOf(PropTypes.string),
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  _onClick = () => {
    // if (this.props.onSelect) {
    //   const id = e.target.id;
    //   if (id.startsWith(PREFIX)) {
    //     const inf = id.substring(PREFIX.length);
    //     this.props.onSelect(inf);
    //   }
    // }
  };

  render() {

    const adminCls = classNames(
      'adminDown',
      { [`${INF_CLS_PREFIX}3`]: true },
    );

    const linkCls = classNames(
      'linkUp',
      { [`${INF_CLS_PREFIX}2`]: true },
    );

    const selectedCls = null;
    // if (this.props.select) {
    //   selectedCls = classNames(
    //     'selected',
    //     this.props.select.map( k => `${PREFIX}${k}` ),
    //   );
    // }

    return (
      <div className="boxGraphic" onClick={this._onClick}>
        <div className={selectedCls}>
          <div className={adminCls}>
            <div className={linkCls}>
              {this.props.children}
            </div>
          </div>
        </div>
      </div>
    );
  }

}
