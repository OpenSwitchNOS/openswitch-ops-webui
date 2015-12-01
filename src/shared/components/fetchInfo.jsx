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

import React, { Component } from 'react';
import { t } from 'i18n/lookup.js';

export default class FetchInfo extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const p = this.props;
    return (
      <div>
        <b>{t('isFetching')}</b>
        {`: ${p.isFetching}`}<br/>
        <b>{t('lastError')}</b>
        {`: ${p.lastError}`}<br/>
        <b>{t('lastUpdate')}</b>
        {`: ${new Date(p.lastUpdate)}`}
      </div>
    );
  }

}
