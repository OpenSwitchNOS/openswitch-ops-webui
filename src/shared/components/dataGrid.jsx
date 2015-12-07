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

import './dataGrid.scss';

import React, { PropTypes, Component } from 'react';
import { t } from 'i18n/lookup.js';
import _ from 'lodash';
import { Table, Column, Cell } from 'fixed-data-table';
import SearchInput from 'grommet/components/SearchInput';
import DownIcon from 'grommet/components/icons/base/CaretDown';
import UpIcon from 'grommet/components/icons/base/CaretUp';
import CheckBox from 'grommet/components/CheckBox';
import EditIcon from 'grommet/components/icons/base/Edit';
import Title from 'grommet/components/Title';
import Menu from 'grommet/components/Menu';
import Toolbar from 'toolbar.jsx';

const ASC = 'asc';
const DESC = 'desc';

// Export a reference to the Cell component so that users can create custom cell
// renderers.

export const CustomCell = Cell;

// Encapsulates the header cells that handle sorting of a column.

class SortHeaderCell extends Component {

  static propTypes = {
    children: PropTypes.node,
    columnKey: PropTypes.string.isRequired,
    onSortChange: PropTypes.func.isRequired,
    sortDirection: PropTypes.string,
  };

  static defaultProps = {
    sortDirection: null,
  };

  static UP = <UpIcon className="tiny" />;
  static DOWN = <DownIcon className="tiny" />;
  static NONE = <UpIcon className="tiny noColor"/>;

  static toggleSortDir(ds) { return ds === DESC ? ASC : DESC; }

  static renderSortInd(sd) {
    return (sd === ASC)
        ? SortHeaderCell.UP : (sd === DESC)
            ? SortHeaderCell.DOWN : SortHeaderCell.NONE;
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  _onClickHeader = e => {
    e.preventDefault();
    const sd = SortHeaderCell.toggleSortDir(this.props.sortDirection);
    this.props.onSortChange(this.props.columnKey, sd);
  };

  render() {
    const si = SortHeaderCell.renderSortInd(this.props.sortDirection);
    return (
      <Cell {...this.props} onClick={this._onClickHeader}>
        {this.props.children} {si}
      </Cell>
    );
  }
}

class DataMap {

  constructor(data, dataKeyArray) {
    this.data = data;
    this.dataKeyArray = dataKeyArray || Object.getOwnPropertyNames(data);
  }

  size() { return this.dataKeyArray.length; }

  getDataKeyAt(index) { return this.dataKeyArray[index]; }

  getDataAt(index) {
    const dataKey = this.dataKeyArray[index];
    return this.data[dataKey];
  }

  getDataAtKey(dataKey) { return this.data[dataKey]; }

  cloneDataKeyArray() { return this.dataKeyArray.slice(); }
}


export default class DataGrid extends Component {

  static propTypes = {
    columns: PropTypes.arrayOf(PropTypes.shape({
      columnKey: PropTypes.string.isRequired,
    })).isRequired,
    computedAvailableHeight: PropTypes.number,
    computedAvailableWidth: PropTypes.number,
    data: PropTypes.object.isRequired,
    headerHeight: PropTypes.number,
    height: PropTypes.number.isRequired,
    noFilter: PropTypes.bool,
    noSelect: PropTypes.bool,
    onEdit: PropTypes.func,
    onSelectChange: PropTypes.func,
    rowHeight: PropTypes.number,
    singleSelect: PropTypes.bool,
    title: PropTypes.string,
    width: PropTypes.number.isRequired,
  };

  static defaultProps = {
    headerHeight: 40,
    rowHeight: 40,
  }

  static mkFiltered(defaultDataMap, dataKeyArray, filterText) {
    if (!filterText) {
      return dataKeyArray;
    }
    const filteredKeyArray = [];
    for (let i=0; i<defaultDataMap.size(); i++) {
      const dataKey = defaultDataMap.getDataKeyAt(i);
      const rowData = defaultDataMap.getDataAtKey(dataKey);
      if (!DataGrid.filterRowData(rowData, filterText)) {
        filteredKeyArray.push(dataKey);
      }
    }
    return filteredKeyArray;
  }

  static filterRowData(rowData, filterText) {
    for (const key in rowData) {
      if (rowData.hasOwnProperty(key)) {
        const val = rowData[key];
        const type = typeof val;
        if (type === 'string' && val.toLowerCase().indexOf(filterText) !== -1) {
          return false;
        }
        if (type === 'number' && val.toString().indexOf(filterText) !== -1) {
          return false;
        }
      }
    }
    return true;
  }

  static sort(defaultDataMap, dataKeyArray, sortingSpecs) {
    const ss0 = sortingSpecs && sortingSpecs[0];
    if (ss0) {
      const cmp = DataGrid.mkSortCompareFn(ss0.columnKey, ss0.sortDirection);
      dataKeyArray.sort((dataKey1, dataKey2) => {
        return cmp(
          defaultDataMap.getDataAtKey(dataKey1),
          defaultDataMap.getDataAtKey(dataKey2)
        );
      });
    }
  }

  static mkSortCompareFn(columnKey, sortDirection) {
    const k = columnKey;
    return (rowDataA, rowDataB) => {
      const a = rowDataA[k];
      const b = rowDataB[k];
      let result = 0;
      if (a > b) {
        result = 1;
      } else if (a < b) {
        result = -1;
      }
      if (result !== 0 && sortDirection === ASC) {
        result = result * -1;
      }
      return result;
    };
  }

  constructor(props) {
    super(props);

    const defaultDataMap = new DataMap(props.data);

    this.selectCbId = _.uniqueId('dataGridSelCb_');

    this.state = {
      activeDataKeys: [],
      filterText: null,
      sortingSpecs: [],
      defaultDataMap,
      dataMap: new DataMap(props.data, defaultDataMap.cloneDataKeyArray()),
    };
  }

  componentWillReceiveProps(newProps) {
    if (newProps.data !== this.props.data) {
      const defaultDataMap = new DataMap(newProps.data);

      let dataKeyArray = defaultDataMap.cloneDataKeyArray();

      const ft = this.state.filterText;
      dataKeyArray = DataGrid.mkFiltered(defaultDataMap, dataKeyArray, ft);

      DataGrid.sort(defaultDataMap, dataKeyArray, this.state.sortingSpecs);

      const dataMap = new DataMap(newProps.data, dataKeyArray);
      this.setState({ defaultDataMap, dataMap });
    }
  }

  _onRowClick = (e, rowIdx) => {
    if (!this.props.noSelect) {
      let activeDataKeys = this.state.activeDataKeys.slice();
      const dataKey = this.state.dataMap.getDataKeyAt(rowIdx);
      const pos = activeDataKeys.indexOf(dataKey);

      if (this.props.singleSelect) {
        activeDataKeys = (pos >= 0) ? [] : [ dataKey ];
      } else if (pos >= 0) {
        activeDataKeys.splice(pos, 1);
      } else {
        activeDataKeys.push(dataKey);
      }

      this.setState({ activeDataKeys });

      if (this.props.onSelectChange) {
        this.props.onSelectChange(activeDataKeys.slice());
      }
    }
  }

  _rowClassName = (rowIdx) => {
    const dataKey = this.state.dataMap.getDataKeyAt(rowIdx);
    return this.state.activeDataKeys.indexOf(dataKey) >= 0 ? 'active' : null;
  }

  _onSelectToggle = (e) => {
    const activeDataKeys = e.target.checked ?
      this.state.dataMap.cloneDataKeyArray() : [];

    this.setState({ activeDataKeys });

    if (this.props.onSelectChange) {
      this.props.onSelectChange(activeDataKeys.slice());
    }
  }

  _onHeaderSortChange = (columnKey, sortDirection) => {
    const sortingSpecs = [ {columnKey, sortDirection} ];
    const defaultDataMap = this.state.defaultDataMap;

    let dataKeyArray = defaultDataMap.cloneDataKeyArray();
    const ft = this.state.filterText;
    dataKeyArray = DataGrid.mkFiltered(defaultDataMap, dataKeyArray, ft);
    DataGrid.sort(defaultDataMap, dataKeyArray, sortingSpecs);

    const dataMap = new DataMap(this.props.data, dataKeyArray);
    this.setState({ sortingSpecs, dataMap });
  }

  _onFilterChange = (text) => {
    const filterText = text.toLowerCase();
    const defaultDataMap = this.state.defaultDataMap;

    let dataKeyArray = defaultDataMap.cloneDataKeyArray();
    dataKeyArray = DataGrid.mkFiltered(
      defaultDataMap, dataKeyArray, filterText
    );

    DataGrid.sort(defaultDataMap, dataKeyArray, this.state.sortingSpecs);

    const dataMap = new DataMap(this.props.data, dataKeyArray);
    this.setState({ filterText, dataMap });
  }

  _onEditClicked = () => {
    this.props.onEdit(this.state.activeDataKeys.slice());
  }

  _mkCell = (cellProps, colProps) => {
    const rowData = this.state.dataMap.getDataAt(cellProps.rowIndex);
    const cellData = rowData && rowData[cellProps.columnKey];
    if (!colProps.cell) {
      return ( <Cell {...cellProps}>{cellData}</Cell> );
    }
    return colProps.cell(cellData, cellProps, colProps);
  }

  _mkColumn = (colProps, sortDirection) => {
    return (
      <Column {...colProps}
          header={
            <SortHeaderCell
                columnKey={colProps.columnKey}
                onSortChange={this._onHeaderSortChange}
                sortDirection={sortDirection}>
              {colProps.header}
            </SortHeaderCell>
          }
          key={colProps.columnKey}
          cell={cellProps => this._mkCell(cellProps, colProps)}
      />
    );
  }

  render() {
    // Determine the current sort key and direction
    const ss0 = this.state.sortingSpecs && this.state.sortingSpecs[0];
    const sortColumnKey = ss0 && ss0.columnKey;
    const sortDirection = ss0 && ss0.sortDirection;

    // Create the columns that will be props to the backing data grid.
    const columns = this.props.columns.map(colProps => {
      const sd = sortColumnKey === colProps.columnKey ? sortDirection : null;
      return this._mkColumn(colProps, sd);
    });

    const rowCount = this.state.dataMap.size();

    // Compute the grid dimensions. If are parent in a responsive box then
    // we will be passed the computed dimensions.
    const gridWidth = this.props.computedAvailableWidth || this.props.width;
    const height = this.props.computedAvailableHeight || this.props.height;
    const gridHeight = height - Toolbar.height();

    // Determine which tools are avialable.

    const selectTool = this.props.singleSelect || this.props.noSelect ? null :
      <CheckBox id={this.selectCbId} label="" onChange={this._onSelectToggle}/>;

    let editTool = null;
    const editCb = this.props.onEdit ? this._onEditClicked : null;
    if (editCb) {
      editTool = this.state.activeDataKeys.length > 0 ?
        <a onClick={editCb}><EditIcon/></a> :
        <EditIcon className="disabled"/>;
    }

    const searchTool = this.props.noFilter ? null :
      <SearchInput
          value={this.state.filterText}
          onChange={this._onFilterChange}
          placeHolder={t('search')} />;

    // Create the toolbar based on the current props/state.

    const tb = (
      <Toolbar width={gridWidth}>
        <Menu direction="row" align="center" responsive={false}>
          {selectTool}
          {searchTool}
          <Title>{this.props.title}</Title>
        </Menu>
        {editTool}
      </Toolbar>
    );

    return (
      <div className="dataGrid" style={{height}}>
        {tb}
        <Table
            height={gridHeight}
            width={gridWidth}
            rowHeight={this.props.rowHeight}
            rowsCount={rowCount}
            headerHeight={this.props.headerHeight}
            onRowClick={this._onRowClick}
            rowClassNameGetter={this._rowClassName}
        >
          {columns}
        </Table>
      </div>
    );
  }

}
