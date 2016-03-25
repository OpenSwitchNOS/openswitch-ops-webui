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
import Box from 'grommet/components/Box';
import Layer from 'grommet/components/Layer';
import Title from 'grommet/components/Title';
import Meter from 'grommet/components/Meter';
import RefreshIcon from 'grommet/components/icons/base/Refresh';
import SpanStatus from 'spanStatus.jsx';


export function mkStatusLayer(async, onClose) {
  return !async.lastError && !async.inProgress ? null :
    <AsyncStatusLayer
        data={async}
        onClose={onClose} />;
}

export default class AsyncStatusLayer extends Component {

  static propTypes = {
    data: PropTypes.shape({
      inProgress: PropTypes.bool.isRequired,
      lastSuccessMillis: PropTypes.number.isRequired,
      lastError: PropTypes.shape({
        url: PropTypes.string,
        status: PropTypes.number,
        message: PropTypes.string,
      }),
      numSteps: PropTypes.number.isRequired,
      currStep: PropTypes.number.isRequired,
      currStepMsg: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    }).isRequired,
    onClose: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const data = this.props.data;
    let error = null;

    if (data.lastError) {
      const e = data.lastError;
      const msg = e.message ? e.message.split('\n').join('. ') : null;

      error = (
        <div className="error">
          <p/>
          <Title>
            <SpanStatus space={false} size="large" value="critical">
              {t('failedRequest')}
            </SpanStatus>
          </Title>
          <p/>
          <b>{t('status')}</b><br/>
          {e.status || t('none')}
          <p/>
          <b>{t('message')}</b><br/>
          {msg || t('none')}
          <p/>
          <b>{t('url')}</b><br/>
          {e.url || t('none')}
        </div>
      );
    }

    const steps = data.numSteps <= 1 ? null : (
      <div className={`mHalf ${error ? 'disabled' : ''}`}>
        {data.currStepMsg.length === 0 ? null : (
          <div>
            <br/>
            <i>{data.currStepMsg}</i>
          </div>
        )}
        <Meter
            value={data.currStep}
            max={data.numSteps}
            units={`/ ${data.numSteps}`}
        />
      </div>
    );

    const content = (
      <div>
        <Title className={error ? 'disabled' : null}>
          <RefreshIcon className={data.inProgress ? 'spin mHalf' : 'mHalf'}/>
          {data.title}
        </Title>
        {steps}
        {error}
      </div>
    );

    const cls = !error && !steps ? 'asyncStatus clear' : 'asyncStatus';

    return (
      <Layer
          className={cls}
          onClose={data.lastError ? this.props.onClose : null}
          closer={data.lastError !== null}
          flush
          align="top">
        <Box pad="medium">{content}</Box>
      </Layer>
    );
  }

}
