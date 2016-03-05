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
import DataGrid from 'dataGrid.jsx';
import Box from 'grommet/components/Box';
import _ from 'lodash';
import Layer from 'grommet/components/Layer';
import Button from 'grommet/components/Button';
import Section from 'grommet/components/Section';

class LagEdit extends Component {

  static propTypes = {
    history: PropTypes.object,
    lag: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.cols = [
      {
        columnKey: 'id',
        header: 'Interface ID',
        flexGrow: 1,
        width: 200,
      }
    ];
    this.state = {
      entitiesData: {},
      externalSelect: 2,
      selection: 0,
      editMode: false,
    };
    this.add = false;
    this.remove = false;
    this.entities = {};
    this.fid = _.uniqueId('lagEditForm_');
  }

  _id = s => `${this.fid}_${s}`;


  _onEditToggle = () => {
    const editMode = !this.state.editMode;
    this.setState({ editMode });
  };

  _onEditSubmit = () => {
    //TODO this.props.actions.lag.set(detail, userCfg);
    this._onEditToggle();
  };

  _onClose = () => {
    this.props.history.pushState(null, `/lag`);
  };

  _onSelectChange() {}

  _addToLag() {}

  _removeFromLag() {}

  render() {
    const id = this.props.params.id;
    const lags = this.props.lag.page.lags[id].lagInterfaces;
    const availableInterfacesForLag = {...this.props.lag.page.availableInterfacesForLag};
    const lagInterfaces = {...lags};

    return (
      <Layer
          className="edit"
          onClose={this.props.onClose}
          closer
          flush
          align="center">
          <div className="mLeft">
          <center>
          <Box direction="row">
          <Box>
            <DataGrid title="Available Interfaces" width={600} height={850}
                data={availableInterfacesForLag}
                columns={this.cols}
                singleSelect
                onSelectChange={this._onSelectChange}
            />
            </Box>

            <Section>
            <span>
            <Button
                label="Add To Lag"
                onClick={this._addToLag}
            />
            <br/>
            <Button
                label="Remove From Lag"
                onClick={this._removeFromLag}
            />
            </span>
            </Section>
            <Box>
            <DataGrid title={`LAG${id}`} width={600} height={850}
                data={lagInterfaces}
                columns={this.cols}
                singleSelect
                onSelectChange={this._onSelectChange}
            />
            </Box>

            </Box>
              </center>
          </div>
      </Layer>
    );
  }
}


function select(store) {
  return {
    collector: store.collector,
    lag: store.lag,
  };
}

export default connect(select)(LagEdit);
