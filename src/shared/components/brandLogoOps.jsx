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

import React, { PropTypes, Component } from 'react';
import classNames from 'classnames';

const CLASS_ROOT = 'logo-icon';

class BrandLogo extends Component {

  static propTypes = {
    className: PropTypes.string,
    darkColor: PropTypes.string,
    lightColor: PropTypes.string,
    size: PropTypes.oneOf(['small', 'medium', 'large']),
  };

  render() {
    const cns = classNames(
      CLASS_ROOT,
      { [`${CLASS_ROOT}--${this.props.size}`]: this.props.size },
      this.props.className
    );
    const lc = this.props.lightColor || '#FFF';
    const dc = this.props.darkColor || '#FF6F3E';
    return (
      <svg className={cns} viewBox="0 0 205 140" version="1.1">
        <path style={{fill: lc, stroke: 'none'}}
            d="M 50.324469,2.3e-4 25.162359,14.52758 2.5e-4,29.05297 l 25.162109,14.52734 25.16211,14.52539 0,-20.17187 6.480471,0 20.89453,20.89062 12.55859,-12.56054 -20.93164,-20.92969 -0.0137,0.0137 -5.17383,-5.17383 -13.814451,0 0,-20.17383 z m 74.724611,80.91016 -12.5586,12.56055 20.93164,20.93554 0.0137,-0.0137 5.17382,5.17383 13.81446,0 0,20.17383 25.16015,-14.53125 25.16407,-14.52734 -25.16407,-14.52735 -25.16015,-14.52734 0,20.17578 -6.48633,0 -20.88867,-20.89258 z"
        />
        <path style={{fill: dc, stroke: 'none'}}
            d="m 112.897,45.856 -0.069,-0.07 -56.018,56.017 -6.486,0 0,-20.175 L 25.163,96.155 0,110.682 l 25.163,14.527 25.161,14.531 0,-20.173 13.814,0 5.174,-5.174 0.014,0.013 55.651,-55.653 0.072,0.071 20.893,-20.891 6.482,0 0,20.173 L 177.585,43.58 202.748,29.053 177.585,14.527 152.424,0 l 0,20.174 -13.814,0 -5.175,5.173 -0.013,-0.013 z"
        />
      </svg>
    );
  }

}

export const navLogo = <BrandLogo />;

export const loginLogo = <BrandLogo size="large" lightColor="grey"/>;
