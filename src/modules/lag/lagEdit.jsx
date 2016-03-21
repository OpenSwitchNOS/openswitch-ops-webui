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
import Footer from 'grommet/components/Footer';
import { t } from 'i18n/lookup.js';

class LagEdit extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
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
  this.check = {};
  const id = this.props.params.id;
  if (id) {
    lagInterfacesData = this.loadLagInterfaces();
    this.lagInterfaces = lagInterfacesData;
    this.check = lagInterfacesData;
  }

  const availableInterfaces = {...this.props.lag.page.availableInterfaces};
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
    availableInterfaces,
  };
  this.add = false;
  this.remove = false;
  this.lagInterfacesRemoved = {};
  this.availableInterfaces = {...this.props.lag.page.availableInterfaces};
  this.fid = _.uniqueId('lagEditForm_');
}

  componentDidMount() {
    this.props.actions.lag.fetch();

  }

  componentWillReceiveProps(nextProps) {
    this.props.actions.lag.fetch(nextProps.params.id);
  }

  loadLagInterfaces = () => {
    const id = this.props.params.id;
    const lagInterfaces = this.props.lag.page.lags[id].lagInterfaces;
    const lagInterfacesToBePassed = {};
    for (const i in lagInterfaces) {
      lagInterfacesToBePassed[i] = {
        id: lagInterfaces[i].id,
      };
    }
    return lagInterfacesToBePassed;
  };

  _id = s => `${this.fid}_${s}`;

  //TODO: Should move to its own component
_isDirty = () => {
  const lagInterfaces = this.state.lagInterfacesData;
  return !_.isEqual(lagInterfaces, this.loadLagInterfaces());
};

_onEditToggle = () => {
  const editMode = !this.state.editMode;
  this.setState({ editMode });
};

//TODO: Find a better way to do this. ( Removal stuff mainly )
//TODO: Have to Rename variables
_onEditSubmit = () => {
  const lag = this.state.lagInterfacesData;
  const lagPorts = this.props.lag.page.ports;
  const lagId = this.props.params.id;
  const lagInterfacesToRemove = this.state.lagInterfacesToBeRemoved;
  if (Object.getOwnPropertyNames(lagInterfacesToRemove).length > 0 ) {
    this.props.actions.lag.removeInterfaceFromLag(lagInterfacesToRemove);
  }
  const lagEdit = this.props.actions.lag;
  lagEdit.editLag(lag, lagPorts, lagId, lagInterfacesToRemove);
  this.props.onClose();
  this._onEditToggle();
};


searchSelection = (sel) => {
  for (const i in this.availableInterfaces) {
    const lagInterfaces = this.state.lagInterfacesData[i];
    const availableInterfaces = this.availableInterfaces[`${sel}`];
    if (lagInterfaces === availableInterfaces) {
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
    this.setState({availableInterfaces: this.availableInterfaces});
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
    this.setState({lagInterfacesToBeRemoved: this.lagInterfacesRemoved});
    this.table2data(sel);
  };


  render() {
    const id = this.props.params.id;
    const availableInterfacesForLag = {...this.state.availableInterfaces};
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
          <Footer pad={{vertical: 'medium'}}>
          <center> &nbsp; &nbsp;
          <span>
              <Button
                  label={t('deploy')}
                  primary
                  onClick={this._isDirty() ? this._onEditSubmit : null}/>
          </span>
          </center>
          </Footer>
          </Box>
          </center>
          </div>
      </Layer>
    );
  }
}


function select(store) {
  return {
    lag: store.lag,
  };
}

export default connect(select)(LagEdit);
