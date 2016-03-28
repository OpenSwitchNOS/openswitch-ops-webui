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
import { t } from 'i18n/lookup.js';


export function pr(name, data, wName, wData) {
  return (
    <PropRow name={name} data={data} widthName={wName} widthData={wData} />
  );
}

export default class PropRow extends Component {

  static propTypes = {
    data: PropTypes.node,
    name: PropTypes.string.isRequired,
    widthData: PropTypes.number,
    widthName: PropTypes.number,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const name = this.props.name;
    const data = this.props.data;
    const wName = this.props.widthName;
    const wData = this.props.widthData;
    return (
      <tr>
        {wName
          ? <td style={{width: wName}}>{t(name)}:</td>
          : <td>{t(name)}:</td>}
        {wData
          ? <td style={{width: wData}}>{data}</td>
          : <td>{data}</td>}
      </tr>
    );
  }
}
