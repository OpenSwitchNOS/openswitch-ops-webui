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
import DataGrid from 'dataGrid.jsx';
import Section from 'grommet/components/Section';
import ActionsIcon from 'grommet/components/icons/base/Actions';
import Button from 'grommet/components/Button';
import CheckBox from 'grommet/components/CheckBox';
import Anchor from 'grommet/components/Anchor';
import Menu from 'grommet/components/Menu';


class DemoDataGridSmallPage extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    demo: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.cols = [
      {
        columnKey: 'id',
        header: t('id'),
        width: 200,
      },
      {
        columnKey: 'text',
        header: t('text'),
        width: 500,
      },
    ];
    this.state = {
      externalSelect: '2',
    };
  }

  _onRefresh = () => {
    this.props.actions.demo.fetch();
  };

  componentDidMount() {
    const p = this.props;
    p.actions.demo.fetch();
    p.actions.toolbar.setFetchTB(p.demo.asyncStatus, this._onRefresh);
  }

  componentWillReceiveProps(nextProps) {
    const p = nextProps;
    p.actions.toolbar.setFetchTB(p.demo.asyncStatus, this._onRefresh);
  }

  componentWillUnmount() {
    this.props.actions.toolbar.clear();
  }

  _onEdit = (selection) => {
    alert(`edit ${selection}`);
  };

  _onDelete = (selection) => {
    alert(`delete ${selection}`);
  };

  _onAdd = () => {
    alert('add');
  };

  _onAction = () => {
    alert('action');
  };

  _onSelectChange = (selId) => {
    this.setState({ externalSelect: selId });
  };

  _onSelectLast = () => {
    const selId = Object.keys(this.props.demo.entities).length;
    this.setState({ externalSelect: selId.toString() });
  };

  render() {
    const entities = this.props.demo.entities;
    return (
      <div className="mLeft">
        <Section>
          <DataGrid title="Full Toolbar" width={700} height={200}
              data={entities}
              columns={this.cols}
              onEdit={this._onEdit}
              onAdd={this._onAdd}
              onDelete={this._onDelete}
          />
        </Section>
        <Section>
          <DataGrid title="Select / No Edit" width={700} height={200}
              data={entities}
              columns={this.cols}
              toolbar={[
                <Menu key="k1" label="Actions">
                  <Anchor
                      onClick={this._onAction}>
                      Text1
                  </Anchor>
                  <Anchor
                      onClick={this._onAction}>
                      Text2
                  </Anchor>
                </Menu>,
                <Menu key="k2" icon={<ActionsIcon/>}>
                  <Anchor
                      onClick={this._onAction}>
                      Text1
                  </Anchor>
                  <Anchor
                      onClick={this._onAction}>
                      Text2
                  </Anchor>
                </Menu>
              ]}
          />
        </Section>
        <Section>
          <DataGrid title="Single Select" width={700} height={200}
              data={entities}
              columns={this.cols}
              singleSelect
              onSelectChange={this._onSelectChange}
              select={this.state.externalSelect}
              onEdit={this._onEdit}
              toolbar={[
                <CheckBox className="mLeft mTopBottomAuto"
                    key="cb1"
                    id="cb1"
                    name="cb1"
                    label="Details"/>
              ]}
          />
          <br/>
          <Button label="Select Last" onClick={this._onSelectLast} />
        </Section>
      </div>
    );
  }

}

const select = (store) => ({ demo: store.demo });

export default connect(select)(DemoDataGridSmallPage);
