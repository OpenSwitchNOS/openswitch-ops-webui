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

import { t } from 'i18n/lookup.js';
import React, { PropTypes, Component } from 'react';
import { Table, Column, Cell } from 'fixed-data-table';
import Toolbar from 'toolbar.jsx';
import BoxIcon from 'boxIcon.jsx';
import SearchInput from 'searchInput.jsx';

const ASC = 'asc';
const DESC = 'desc';

export const CustomCell = Cell;


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

  static SORT_DOWN = 'fa fa-long-arrow-down';
  static SORT_UP = 'fa fa-long-arrow-up';
  static SORT_NONE = 'fa fa-long-arrow-up noColor';

  constructor(props) {
    super(props);
    this.state = {};
  }

  static toggleSortDir(ds) { return ds === DESC ? ASC : DESC; }

  onClickHeader = e => {
    e.preventDefault();
    const sd = SortHeaderCell.toggleSortDir(this.props.sortDirection);
    this.props.onSortChange(this.props.columnKey, sd);
  };

  static renderSortInd(sd) {
    const cls = (sd === ASC)
        ? SortHeaderCell.SORT_UP : (sd === DESC)
            ? SortHeaderCell.SORT_DOWN : SortHeaderCell.SORT_NONE;
    return <span className={cls}/>;
  }

  render() {
    const si = SortHeaderCell.renderSortInd(this.props.sortDirection);
    return (
      <Cell {...this.props} className="sortHeader" onClick={this.onClickHeader}>
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
    onRowSelected: PropTypes.func,
    rowHeight: PropTypes.number,
    singleSelect: PropTypes.bool,
    title: PropTypes.string,
    toolbarHeight: PropTypes.number,
    width: PropTypes.number.isRequired,
  };

  static defaultProps = {
    headerHeight: 40,
    onRowsSelectoned: null,
    rowHeight: 40,
    toolbarHeight: 46,
  }

  constructor(props) {
    super(props);

    const defaultDataMap = new DataMap(props.data);

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

  onRowClick = (e, rowIdx) => {
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
    }
  }

  rowClassName = (rowIdx) => {
    const dataKey = this.state.dataMap.getDataKeyAt(rowIdx);
    return this.state.activeDataKeys.indexOf(dataKey) >= 0 ? 'active' : null;
  }

  onSelectAll = () => {
    this.setState({ activeDataKeys: this.state.dataMap.cloneDataKeyArray() });
  }

  onUnselectAll = () => {
    this.setState({ activeDataKeys: [] });
  }

  onHeaderSortChange = (columnKey, sortDirection) => {
    const sortingSpecs = [ {columnKey, sortDirection} ];
    const defaultDataMap = this.state.defaultDataMap;

    let dataKeyArray = defaultDataMap.cloneDataKeyArray();
    const ft = this.state.filterText;
    dataKeyArray = DataGrid.mkFiltered(defaultDataMap, dataKeyArray, ft);
    DataGrid.sort(defaultDataMap, dataKeyArray, sortingSpecs);

    const dataMap = new DataMap(this.props.data, dataKeyArray);
    this.setState({ sortingSpecs, dataMap });
  }

  onFilterChange = (text) => {
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

  onEditClicked = () => {
    this.props.onEdit(this.state.activeDataKeys.slice());
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

  mkCell(cellProps, colProps) {
    const rowData = this.state.dataMap.getDataAt(cellProps.rowIndex);
    const cellData = rowData && rowData[cellProps.columnKey];
    if (!colProps.cell) {
      return ( <Cell {...cellProps}>{cellData}</Cell> );
    }
    return colProps.cell(cellData, cellProps, colProps);
  }

  mkColumn(colProps, sortDirection) {
    return (
      <Column {...colProps}
          header={
            <SortHeaderCell
                columnKey={colProps.columnKey}
                onSortChange={this.onHeaderSortChange}
                sortDirection={sortDirection}>
              {colProps.header}
            </SortHeaderCell>
          }
          key={colProps.columnKey}
          cell={cellProps => this.mkCell(cellProps, colProps)}
      />
    );
  }

  render() {
    const ss0 = this.state.sortingSpecs && this.state.sortingSpecs[0];
    const sortColumnKey = ss0 && ss0.columnKey;
    const sortDirection = ss0 && ss0.sortDirection;

    const columns = this.props.columns.map(colProps => {
      const sd = sortColumnKey === colProps.columnKey ? sortDirection : null;
      return this.mkColumn(colProps, sd);
    });

    const rowCount = this.state.dataMap.size();
    const toolbarHeight = this.props.toolbarHeight;

    const gridWidth = this.props.computedAvailableWidth || this.props.width;
    const height = this.props.computedAvailableHeight || this.props.height;
    const gridHeight = height - toolbarHeight;

    const selectTools = this.props.singleSelect || this.props.noSelect ? null :
      <span>
        &nbsp;
        <BoxIcon fa="bars" onClick={this.onSelectAll}/>
        &nbsp;
        <BoxIcon fa="remove" onClick={this.onUnselectAll}/>
      </span>;

    const filterTool = this.props.noFilter ? null :
      <span>
        &nbsp;
        <SearchInput
            value={this.state.filterText}
            onChange={this.onFilterChange}
            placeHolder={t('filter')}
        />
      </span>;

    const editCb = this.props.onEdit ? this.onEditClicked : null;
    const editEbl = this.state.activeDataKeys.length > 0;
    const editTool = (
      <BoxIcon fa="gear"
          noColor={!editCb}
          disabled={!editEbl}
          onClick={editEbl ? editCb : null}
      />
    );

    return (
      <div className="dataGrid" style={{height}}>

        <Toolbar height={toolbarHeight} spaceBetween>
          <span className="left flexItem1">
            {selectTools}
            {filterTool}
          </span>
          <span className="title textAlignCenter flexItem2">
            {this.props.title}
          </span>
          <span className="flexItem1 textAlignRight">
            {editTool}
          </span>
        </Toolbar>

        <Table
            height={gridHeight}
            width={gridWidth}
            rowHeight={this.props.rowHeight}
            rowsCount={rowCount}
            headerHeight={this.props.headerHeight}
            onRowClick={this.onRowClick}
            rowClassNameGetter={this.rowClassName}
        >
          {columns}
        </Table>

      </div>
    );
  }

}
