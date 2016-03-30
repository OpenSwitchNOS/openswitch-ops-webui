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
import Layer from 'grommet/components/Layer';
import Footer from 'grommet/components/Footer';
import Menu from 'grommet/components/Menu';
import Button from 'grommet/components/Button';
import Title from 'grommet/components/Title';
import { t } from 'i18n/lookup.js';
import Box from 'grommet/components/Box';
import OneToMany from 'oneToMany.jsx';


class LagEdit extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    constants: PropTypes.object.isRequired,
    lag: PropTypes.object.isRequired,
    lagId: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.cols = [{
      columnKey: 'id',
      header: t('id'),
      width: 180,
    }];

    const lagInfs = props.lag.lags[props.lagId].interfaces;

    this.availInfsInit = { ...props.lag.availInterfaces };
    this.lagInfsInit = { ...lagInfs };

    this.state = {
      availInfs: { ...this.availInfsInit },
      lagInfs: { ...this.lagInfsInit },
      diff: { addedCount: 0, added: {}, removedCount: 0, removed: {}, }
    };
  }

  _onChangeLag = (lagInfs, availInfs, diff) => {
    this.setState({ lagInfs, availInfs, diff });
  };

  _onOk = () => {
    this.props.actions.lag.editLag(this.props.lagId, this.state);
    this.props.onClose();
  };

  render() {
    const isDirty = this.state.diff.addedCount +
      this.state.diff.removedCount > 0;

    return (
      <Layer
          className="edit"
          onClose={this.props.onClose}
          closer
          flush
          align="right">
        <Box pad="medium" className="flex1">
          <Title>{t('editLag')}</Title>
          <br/>
          <b>{t('addDeleteInterfacesFromLag')}</b>
          <br/>
          <OneToMany
              fullSetInit={this.availInfsInit}
              fullSetTitle="Available"
              fullSet={this.state.availInfs}
              fullSetCols={this.cols}
              subSetInit={this.lagInfsInit}
              subSetTitle={`LAG ${this.props.lagId}`}
              subSet={this.state.lagInfs}
              subSetCols={this.cols}
              onChange={this._onChangeLag}
              maxSubSetSize={this.props.constants.LAG_MAX_INTERFACES}
          />
          <Footer pad={{vertical: 'medium'}}>
            <Menu>
              <Button
                  label={t('ok')}
                  primary
                  onClick={isDirty ? this._onOk : null}/>
            </Menu>
          </Footer>
        </Box>
      </Layer>
    );
  }
}

const select = (store) => ({
  constants: store.constants,
  lag: store.lag
});

export default connect(select)(LagEdit);
