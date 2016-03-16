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
    lag: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    let lagInterfacesData = {};
    const id = this.props.params.id;
    if (id) {
      lagInterfacesData = {...this.props.lag.page.lags[id].lagInterfaces};
    }
    this.cols = [
      {
        columnKey: 'id',
        header: 'Interface ID',
        flexGrow: 1,
        width: 200,
      }
    ];
    this.state = {
      lagInterfacesData,
      sel: 0,
      editMode: false,
      lagInterfacesToBeRemoved: {},
    };
    this.add = false;
    this.remove = false;
    this.lagInterfacesRemoved = {};
    this.availableInterfaces = {...this.props.lag.page.availableInterfaces};
    this.lagInterfaces = this.props.lag.page.lags[id].lagInterfaces;
    this.fid = _.uniqueId('lagEditForm_');
  }

  _id = s => `${this.fid}_${s}`;


  _onEditToggle = () => {
    const editMode = !this.state.editMode;
    this.setState({ editMode });
  };

  _onEditSubmit = () => {
    const lagInterfaces = this.state.lagInterfacesData;
    const ports = this.props.lag.page.ports;
    const id = this.props.params.id;
    const interfacesToBeRemoved = this.state.lagInterfacesToBeRemoved;
    this.props.onSubmit(lagInterfaces, ports, id, interfacesToBeRemoved);
    this._onEditToggle();
  };


searchSelection = (sel) => {
  for (const i in this.props.lag.page.availableInterfaces[`${sel}`]) {
    const lagInterface = this.lagInterfaces[i];
    const availableInterface = this.props.lag.page.availableInterfaces[`${sel}`];
    if (lagInterface === availableInterface) {
      return true;
    }
    return false;
  }
};

table2data = (sel) => {
  if (sel !== null) {
    if (this.add === true) {
      if (Object.keys(this.lagInterfaces).length < 8) {
        const elementExists =this.searchSelection(sel);
        if (!elementExists) {
          this.lagInterfaces[`${sel}`] = this.availableInterfaces[`${sel}`];
          delete this.availableInterfaces[`${sel}`];
        } else {
          alert('This interface already is already present in the LAG');
        }
      } else {
        alert('Should be 8!!!');
      }
      this.add = false;
    }


    if (this.remove === true) {
      if (this.lagInterfaces[`${sel}`]) {
        this.availableInterfaces[`${sel}`] = this.lagInterfaces[`${sel}`];
      } else {
        alert('Contents of Available Interface Cannot be Removed.');
      }
      delete this.lagInterfaces[`${sel}`];
      this.remove = false;
    }
    this.setState({lagInterfacesData: this.lagInterfaces});
  }

};


  _addToLag = () => {
    this.add = true;
    const sel = this.state.sel;
    this.table2data(sel);

  };

  _onSelectChange = (sel) => {
    this.setState({sel});
  };

  _removeFromLag = () => {
    this.remove = true;
    const sel = this.state.sel;
    this.lagInterfacesRemoved[`${sel}`] = sel;
    this.setState({lagInterfacesToBeRemoved: this.lagInterfacesRemoved });
    this.table2data(sel);
  };


  render() {
    const id = this.props.params.id;
    const availableInterfacesForLag = {...this.availableInterfaces};
    const lags = {...this.state.lagInterfacesData};


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
            <DataGrid title="Available Interfaces" width={300} height={750}
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
            <DataGrid title={`LAG${id}`} width={300} height={750}
                data={lags}
                columns={this.cols}
                singleSelect
                onSelectChange={this._onSelectChange}
            />
            </Box>
            <Button
                label="Deploy"
                onClick={this._onEditSubmit}
            />
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
