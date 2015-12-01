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

import './toolbar.scss';

import React, { PropTypes, Component } from 'react';
import classNames from 'classnames';

export default class Toolbar extends Component {

  static propTypes = {
    borderBottom: PropTypes.bool,
    children: PropTypes.node,
    className: PropTypes.string,
    flex: PropTypes.number,
    height: PropTypes.number,
    id: PropTypes.string,
    spaceAround: PropTypes.bool,
    spaceBetween: PropTypes.bool,
    wrap: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { id, height } = this.props;
    const style = height && { height };

    const cls = classNames(
      'toolbar',
      'flexContainer',
      'flexRow',
      'alignItemsCenter',
      'noOverflow',
      { borderBottom: this.props.borderBottom },
      { flexSpaceAround: this.props.spaceAround },
      { flexSpaceBetween: this.props.spaceBetween },
      { flexItem0: this.props.flex === 0 },
      { flexItem1: this.props.flex === 1 },
      { flexItem2: this.props.flex === 2 },
      { wrap: this.props.wrap },
    );

    return (
      <div id={id} style={style} className={cls}>
        {this.props.children}
      </div>
    );
  }

}
