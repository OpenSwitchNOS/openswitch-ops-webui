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
import { connect } from 'react-redux';
import { t } from 'i18n/lookup.js';
import Button from 'grommet/components/Button';

import ConfirmLayer from 'confirmLayer.jsx';
import StatusLayer from 'statusLayer.jsx';
import AsyncStatusLayer from 'asyncStatusLayer.jsx';


class DemoLayerPage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    demo: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      asyncStatusData: {
        title: t('loading'),
        inProgress: false,
        lastSuccessMillis: 0,
        lastError: null,
        numSteps: 0,
        currStep: 0,
        currStepMsg: '',
      }
    };
  }

  _onOpenAsyncStatus = () => {
    const asyncStatusData = { ...this.state.asyncStatusData };
    asyncStatusData.inProgress = true;
    asyncStatusData.currStep = 1;
    asyncStatusData.numSteps = 3;
    asyncStatusData.currStepMsg = 'Step #1';
    this.setState({ asyncStatusData });
    setTimeout(() => {
      asyncStatusData.currStep = 2;
      asyncStatusData.currStepMsg = 'Step #2';
      this.setState({ asyncStatusData });
      setTimeout(() => {
        asyncStatusData.currStep = 3;
        asyncStatusData.currStepMsg = 'Step #3';
        this.setState({ asyncStatusData });
        setTimeout(() => {
          asyncStatusData.inProgress = false;
          asyncStatusData.lastSuccessMillis = Date.now();
          this.setState({ asyncStatusData });
        }, 1000);
      }, 1000);
    }, 1000);
  };

  _onOpenAsyncStatusErr = () => {
    const asyncStatusData = { ...this.state.asyncStatusData };
    asyncStatusData.lastError = {
      url: '/rest/v1/blah/bogus',
      status: 123,
      msg: 'Some message',
      respMsg: 'Some response message',
    };
    this.setState({ asyncStatusData });
  };

  _onOpenAsyncStatus1 = () => {
    const asyncStatusData = { ...this.state.asyncStatusData };
    asyncStatusData.inProgress = true;
    asyncStatusData.currStep = 1;
    asyncStatusData.numSteps = 1;
    this.setState({ asyncStatusData });
    setTimeout(() => {
      asyncStatusData.inProgress = false;
      asyncStatusData.lastSuccessMillis = Date.now();
      this.setState({ asyncStatusData });
    }, 3000);
  };

  _onOpenInfo = () => {
    this.setState({ info: true });
  };

  _onOpenError = () => {
    this.setState({ error: true });
  };

  _onOpenWarning = () => {
    this.setState({ warning: true });
  };

  _onOpenDialog1 = () => {
    this.setState({ dialog1: true });
  };

  _onOpenDialog2 = () => {
    this.setState({ dialog2: true });
  };

  _onClose = () => {
    const asyncStatusData = { ...this.state.asyncStatusData };
    asyncStatusData.lastError = null;
    this.setState({
      asyncStatusData,
      info: false,
      error: false,
      warning: false,
      dialog1: false,
      dialog2: false,
    });
  };

  _onSubmit = () => {
    alert('Make it so!');
    this._onClose();
  };

  render() {
    const asyncData = this.state.asyncStatusData;
    return (
      <div className="mLeft">

        <p>
          <Button label="Async Status" onClick={this._onOpenAsyncStatus}/>
          &nbsp;
          <Button label="Error" onClick={this._onOpenAsyncStatusErr}/>
          &nbsp;
          <Button label="1 Step" onClick={this._onOpenAsyncStatus1}/>
        </p>
        {asyncData.inProgress || asyncData.lastError ?
          <AsyncStatusLayer
              onClose={this._onClose}
              title="Some Workflow"
              data={asyncData}
          />
          : null
        }

        <p>
          <Button label="Info" onClick={this._onOpenInfo}/>
        </p>
        {this.state.info ?
          <StatusLayer box onClose={this._onClose}>
            The text.
          </StatusLayer> : null
        }

        <p>
          <Button label="Error" onClick={this._onOpenError}/>
        </p>
        {this.state.error ?
          <StatusLayer value="error" onClose={this._onClose}>
            The text.
          </StatusLayer> : null
        }

        <p>
          <Button label="Warning-Configured" onClick={this._onOpenWarning}/>
        </p>
        {this.state.warning ?
          <StatusLayer title="This is a warning" value="warning"
              onClose={this._onClose}>
            The text.
          </StatusLayer> : null
        }

        <p>
          <Button label="Confirm-Defaults" onClick={this._onOpenDialog1}/>
        </p>
        {this.state.dialog1 ?
          <ConfirmLayer onClose={this._onClose} onSubmit={this._onSubmit}>
            The text.
          </ConfirmLayer> : null
        }

        <p>
          <Button label="Confirm-Configured" onClick={this._onOpenDialog2}/>
        </p>
        {this.state.dialog2 ?
          <ConfirmLayer onClose={this._onClose}
              title="Awaiting Confirmation"
              submitLabel="Engage"
              onSubmit={this._onSubmit}>
            Captain, course has been set for the Neutral Zone at Warp factor 10
          </ConfirmLayer> : null
        }

      </div>
    );
  }

}

const select = (store) => ({ demo: store.demo });

export default connect(select)(DemoLayerPage);
