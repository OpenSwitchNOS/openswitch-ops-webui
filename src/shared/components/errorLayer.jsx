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
import StatusLayer from 'statusLayer.jsx';


export default class ErrorLayer extends Component {

  static propTypes = {
    error: PropTypes.shape({
      url: PropTypes.string.isRequired,
      status: PropTypes.number,
      message: PropTypes.string,
    }).isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const p = this.props;
    const msg = p.error.message ? p.error.message.split('\n').join('. ') : null;
    return (
      <StatusLayer
          box
          className="error"
          value="critical"
          onClose={p.onClose}
          title={this.props.title || t('error')} >
        <b>{t('status')}</b><br/>
        {p.error.status || t('none')}
        <p/>
        <b>{t('message')}</b><br/>
        {msg || t('none')}
        <p/>
        <b>{t('url')}</b><br/>
        {p.error.url || t('none')}
      </StatusLayer>
    );
  }

}
