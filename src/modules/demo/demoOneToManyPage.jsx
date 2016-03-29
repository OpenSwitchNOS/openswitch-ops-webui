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
import Box from 'grommet/components/Box';
import OneToMany from 'oneToMany.jsx';


class OneToManyPage extends Component {

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
        width: 180,
      },
    ];
    this.state = {
      fullSetInit: {},
      fullSet: {},
      subSet: {},
      subSetInit: {},
      diff: { added: {}, removed: {} },
    };
  }

  _onRefresh = () => {
    this.props.actions.demo.fetch();
  };

  componentDidMount() {
    const p = this.props;
    p.actions.demo.fetch();
  }

  componentWillReceiveProps(nextProps) {
    const entities = { ...nextProps.demo.entities };
    const e3 = entities[3];
    delete entities[3];
    this.setState({
      fullSetInit: entities,
      fullSet: entities,
      subSetInit: { 3: e3 },
      subSet: { 3: e3 },
    });
  }

  _onChange = (subSet, fullSet, diff) => {
    this.setState({ subSet, fullSet, diff });
  };

  render() {
    const diff = this.state.diff;
    return (
      <Box className="mLeft mTop">
        <OneToMany
            fullSetInit={this.state.fullSetInit}
            fullSet={this.state.fullSet}
            fullSetCols={this.cols}
            subSetInit={this.state.subSetInit}
            subSet={this.state.subSet}
            subSetCols={this.cols}
            onChange={this._onChange}
            maxSubSetSize={8}
        />
        <div>
          Added: ({diff.addedCount}) {Object.keys(diff.added).join(', ')}
        </div>
        <div>
          Removed: ({diff.removedCount}) {Object.keys(diff.removed).join(', ')}
        </div>
      </Box>
    );
  }

}

const select = (store) => ({ demo: store.demo });

export default connect(select)(OneToManyPage);
