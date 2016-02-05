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


export default class BoxGraphic extends Component {

  static propTypes = {
    className: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.timer = null;
    this.state = {
      ri: 0,
      rj: 0,
      gi: 1,
      gj: 4
    };
  }

  componentDidMount() {
    this.timer = setInterval(this._onTimer, 300);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  _onTimer = () => {
    let ri = this.state.ri;
    let rj = this.state.rj + 1;
    let gi = this.state.gi;
    let gj = this.state.gj - 1;

    if (rj > 4) {
      rj = 0;
      ri = ri + 1;
      if (ri > 1) { ri = 0; }
    }
    if (gj < 0) {
      gj = 4;
      gi = gi - 1;
      if (gi < 0) { gi = 1; }
    }

    this.setState({ ri, rj, gi, gj });
  };

  render() {
    const s = this.state;
    const redCls = `rect-${s.ri}-${s.rj}`;
    const greenCls = `rect-${s.gi}-${s.rj}`;
    return (
      <div className="boxGraphic">
        <div className={`redOverlay ${redCls}`}>
          <div className={`greenOverlay ${greenCls}`}>
            <svg viewBox="0 0 1000 200" version="1.1">
              <rect id="rect-1-4" x="43.5" y="29" width="20" height="20"/>
              <rect id="rect-1-3" x="71.5" y="29" width="20" height="20"/>
              <rect id="rect-1-2" x="98.3" y="29" width="20" height="20"/>
              <rect id="rect-1-1" x="125" y="29" width="20" height="20"/>
              <rect id="rect-1-0" x="151.8" y="29" width="20" height="20"/>
              <rect id="rect-0-4" x="44.8" y="102.8" width="20" height="20"/>
              <rect id="rect-0-3" x="71.5" y="102.8" width="20" height="20"/>
              <rect id="rect-0-2" x="98.3" y="102.8" width="20" height="20"/>
              <rect id="rect-0-1" x="125" y="102.8" width="20" height="20"/>
              <rect id="rect-0-0" x="151.8" y="102.8" width="20" height="20"/>
            </svg>
          </div>
        </div>
      </div>
    );
  }

}
