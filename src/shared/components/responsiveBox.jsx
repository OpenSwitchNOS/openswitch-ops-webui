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

/*eslint react/no-did-mount-set-state:0*/

import React, { PropTypes, Component } from 'react';
import ReactDOM from 'react-dom';
import elementResizeEvent from 'element-resize-event';
import Box from 'grommet/components/Box';
import classNames from 'classnames';

export default class ResponsiveBox extends Component {

  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      computedWidth: 0,
      computedHeight: 0
    };
  }

  componentDidMount() {
    const node = ReactDOM.findDOMNode(this);
    this.setState({
      computedWidth: node.getBoundingClientRect().width,
      computedHeight: node.getBoundingClientRect().height,
    });
    elementResizeEvent(node, this._onResize);
  }

  componentDidUpdate() {
    const node = ReactDOM.findDOMNode(this);
    if (0 === node.getElementsByClassName('resize-sensor').length) {
      elementResizeEvent(node, this._onResize);
    }
  }

  _onResize = () => {
    const node = ReactDOM.findDOMNode(this);
    this.setState({
      computedWidth: node.getBoundingClientRect().width,
      computedHeight: node.getBoundingClientRect().height,
    });
  };

  render() {
    const children = React.Children.map(this.props.children, child => {
      return React.cloneElement(child, {
        computedAvailableWidth: this.state.computedWidth,
        computedAvailableHeight: this.state.computedHeight,
      });
    });

    const cns = classNames('minBox', 'flex1', this.props.className);

    return (
      <Box className={cns} {...this.props}>
        {children}
      </Box>
    );
  }

}
