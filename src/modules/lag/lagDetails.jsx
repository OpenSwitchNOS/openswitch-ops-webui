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
import Header from 'grommet/components/Header';
import Menu from 'grommet/components/Menu';
import Title from 'grommet/components/Title';
import Anchor from 'grommet/components/Anchor';
import Box from 'grommet/components/Box';
import CloseIcon from 'grommet/components/icons/base/Close';
import _ from 'lodash';



class LagDetails extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    autoActions: PropTypes.object.isRequired,
    collector: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    lag: PropTypes.object.isRequired,
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.fid = _.uniqueId('lagForm_');
    this.state = {
      editMode: false,
    };
  }

  _id = s => `${this.fid}_${s}`;

  componentDidMount() {
    this.props.actions.lag.fetch(this.props.params.id);
  }

  componentWillReceiveProps(nextProps) {
    this.props.actions.lag.fetch(nextProps.params.id);
  }

  _onClose = () => {
    this.props.history.pushState(null, `/lag`);
  };

  _onEditToggle = () => {
    const editMode = !this.state.editMode;
    this.setState({ editMode });
  };

  _onEditSubmit = () => {
    //TODO this.props.actions.lag.set(detail, userCfg);
    this._onEditToggle();
  };

  _onCloseError = () => {
    //this.props.actions.lag.clearErrorForSet();
  };

  _tr = (td1, td2) => {
    return (
      <tr>
        <td style={{width: 200}}>{td1}:</td>
        <td style={{width: 200}}>{td2}</td>
      </tr>
    );
  };

  render() {
    const id = this.props.params.id;
    const lags = this.props.lag.page.lags;

    return (
      <Box pad="small" className="details min200x400">
        <Header tag="h4" justify="between">
          <Title>{`${t('lag')}: ${id}`}</Title>
          <Menu direction="row" justify="end" responsive={false}>
            <Anchor onClick={this._onClose}>
              <CloseIcon/>
            </Anchor>
          </Menu>
        </Header>
        <hr/>

        <table style={{tableLayout: 'fixed'}} className="propTable">
          <tbody>
          {this._tr(t('aggregateName'), id)}
          {this._tr(t('aggregatedInterfaces'), lags[id].interfaces)}
          {this._tr(t('aggregationKey'), lags[id].idModified)}
          {this._tr(t('aggregateMode'), lags[id].lacp)}
          </tbody>
        </table>
        <br/>
      </Box>
    );
  }
}


function select(store) {
  return {
    collector: store.collector,
    lag: store.lag,
  };
}

export default connect(select)(LagDetails);
