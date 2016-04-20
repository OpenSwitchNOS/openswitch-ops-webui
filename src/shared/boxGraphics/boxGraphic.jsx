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


export default class BoxGraphic extends Component {

  static propTypes = {
    interfaces: PropTypes.object.isRequired,
    onSelectChange: PropTypes.func,
    select: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.string,
    ]),
    spec: PropTypes.shape({
      onClick: PropTypes.func.isRequired,
      toExternalInterfaceId: PropTypes.func.isRequired,
      toSvgInterfaceName: PropTypes.func.isRequired,
      svg: PropTypes.node.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  _onClick = (e) => {
    const sel = this.props.spec.onClick(e);
    if (sel) {
      this.props.onSelectChange(sel);
    }
  };

  render() {

    const adminDownIds = [];
    const linkUpIds = [];
    const canSplit = [];
    const isSplit = [];
    const splitAdminDownIds = [];
    const splitLinkUpIds = [];
    Object.getOwnPropertyNames(this.props.interfaces).forEach(k => {
      const inf = this.props.interfaces[k];
      if (inf.canSplit) {
        canSplit.push(k);
      }
      if (inf.cfgLaneSplit === 'split') {
        isSplit.push(k);
        inf.adminState = 'up';
        inf.splitChildren.forEach(i => {
          const childInf = this.props.interfaces[i];
          if (childInf.adminState === 'down') {
            splitAdminDownIds.push(i);
          } else if (childInf.linkState === 'up') {
            splitLinkUpIds.push(i);
          }
        });
      } else if (inf.adminState === 'down') {
        adminDownIds.push(k);
      } else if (inf.linkState === 'up') {
        linkUpIds.push(k);
      }
    });

    const adminCls = classNames(
      'adminDown',
      adminDownIds.map(i => this.props.spec.toSvgInterfaceName(i)),
    );

    const linkCls = classNames(
      'linkUp',
      linkUpIds.map(i => this.props.spec.toSvgInterfaceName(i)),
    );

    const canSplitCls = classNames(
      'canSplit',
      canSplit.map(i => this.props.spec.toSvgInterfaceName(i)),
    );

    const isSplitCls = classNames(
      'isSplit',
      isSplit.map(i => this.props.spec.toSvgInterfaceName(i)),
    );

    const splitLinkCls = classNames(
      'splitLinkUp',
      splitLinkUpIds.map(i => this.props.spec.toSvgInterfaceName(i)),
    );

    const splitAdminCls = classNames(
      'splitAdminDown',
      splitAdminDownIds.map(i => this.props.spec.toSvgInterfaceName(i)),
    );

    const select = this.props.select && [ this.props.select ] || [];
    const selectedCls = classNames(
      'selected',
      select.map(i => this.props.spec.toSvgInterfaceName(i)),
    );

    return (
      <div className="boxGraphic" onClick={this._onClick}>
        <div className={adminCls}>
          <div className={linkCls}>
            <div className={canSplitCls}>
              <div className={isSplitCls}>
                <div className={splitLinkCls}>
                  <div className={splitAdminCls}>
                    <div className={selectedCls}>
                      {this.props.spec.svg}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

}
