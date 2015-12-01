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

import './boxContainer.scss';

import React, { PropTypes, Component } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import elementResizeEvent from 'element-resize-event';

const SPACE = 10;
const SPACE_2X = SPACE * 2;

export default class Box extends Component {

  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    col: PropTypes.bool,
    computeSize: PropTypes.bool,
    flex: PropTypes.number,
    id: PropTypes.string,
    marginBottom: PropTypes.bool,
    marginBottom2x: PropTypes.bool,
    marginLeft: PropTypes.bool,
    marginLeft2x: PropTypes.bool,
    marginRight: PropTypes.bool,
    marginRight2x: PropTypes.bool,
    marginTop: PropTypes.bool,
    marginTop2x: PropTypes.bool,
    pad: PropTypes.bool,
    pad2x: PropTypes.bool,
    page: PropTypes.bool,
    panel: PropTypes.bool,
    row: PropTypes.bool,
    spaceAround: PropTypes.bool,
    spaceBetween: PropTypes.bool,
    wrap: PropTypes.bool,
  };

  static defaultProps = {
    flex: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      computedWidth: 0,
      computedHeight: 0
    };
  }

  componentDidMount() {
    if (this.props.computeSize) {
      const node = ReactDOM.findDOMNode(this);
      this.setState({
        computedWidth: node.getBoundingClientRect().width,
        computedHeight: node.getBoundingClientRect().height,
      });
      elementResizeEvent(node, this.onResize);
    }
  }

  componentDidUpdate() {
    if (this.props.computeSize) {
      const node = ReactDOM.findDOMNode(this);
      if (0 === node.getElementsByClassName('resize-sensor').length) {
        elementResizeEvent(node, this.onResize);
      }
    }
  }

  onResize = () => {
    const node = ReactDOM.findDOMNode(this);
    this.setState({
      computedWidth: node.getBoundingClientRect().width,
      computedHeight: node.getBoundingClientRect().height,
    });
  }

  render() {
    const pad = this.props.pad ? SPACE : (this.props.pad2x ? SPACE_2X : 0);
    const adj = pad * 2;
    let children = this.props.children;
    if (this.props.computeSize) {
      children = React.Children.map(this.props.children, child => {
        return React.cloneElement(child, {
          computedAvailableWidth: this.state.computedWidth - adj,
          computedAvailableHeight: this.state.computedHeight - adj,
        });
      });
    }

    const style = {};
    if (this.props.marginTop) { style.marginTop = SPACE; }
    if (this.props.marginRight) { style.marginRight = SPACE; }
    if (this.props.marginBottom) { style.marginBottom = SPACE; }
    if (this.props.marginLeft) { style.marginLeft = SPACE; }

    if (this.props.marginTop2x) { style.marginTop = SPACE_2X; }
    if (this.props.marginRight2x) { style.marginRight = SPACE_2X; }
    if (this.props.marginBottom2x) { style.marginBottom = SPACE_2X; }
    if (this.props.marginLeft2x) { style.marginLeft = SPACE_2X; }

    if (pad) { style.padding = pad; }

    const cls = classNames(
      'boxContainer',
      this.props.className,
      { panel: this.props.panel },
      { flexContainer: this.props.row || this.props.col },
      { flexRow: this.props.row },
      { flexCol: !this.props.row && this.props.col },
      { page: this.props.page },
      { flexSpaceAround: this.props.spaceAround },
      { flexSpaceBetween: this.props.spaceBetween },
      { flexItem0: this.props.flex === 0 },
      { flexItem1: this.props.flex === 1 },
      { flexItem2: this.props.flex === 2 },
      { flexWrap: this.props.wrap },
    );

    return (
      <div id={this.props.id} style={style} className={cls}>
        {children}
      </div>
    );
  }

}
