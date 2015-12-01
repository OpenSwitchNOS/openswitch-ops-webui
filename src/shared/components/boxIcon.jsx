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

// An icon that can be used to invoke an action and can be disabled.

import './boxIcon.scss';

import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

export default class BoxIcon extends Component {

  static propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool,
    fa: PropTypes.string,
    id: PropTypes.string,
    noColor: PropTypes.bool,
    onClick: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const onClk = !this.props.disabled ? this.props.onClick : null;
    const icon = <i className={`fa fa-lg fa-fw fa-${this.props.fa}`}/>;
    const cls = classNames(
      'boxIcon',
      this.props.className,
      { disabled: this.props.disabled },
      { noColor: this.props.noColor },
    );

    return (
      <span id={this.props.id} onClick={onClk} className={cls}>
        {icon}
      </span>
    );
  }

}
