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

import DemoBox1Page from './demoBox1Page.jsx';
import DemoBox2Page from './demoBox2Page.jsx';
import DemoIconPage from './demoIconPage.jsx';
import DemoColorPage from './demoColorPage.jsx';
import DemoHeaderPage from './demoHeaderPage.jsx';
import DemoTablePage from './demoTablePage.jsx';
import DemoDataGridPage from './demoDataGridPage.jsx';
import DemoDataGridSmallPage from './demoDataGridSmallPage.jsx';
import DemoButtonPage from './demoButtonPage.jsx';
import DemoFormPage from './demoFormPage.jsx';
import DemoLayerPage from './demoLayerPage.jsx';
import DemoMetricPage from './demoMetricPage.jsx';

// Required 'MODULE' name
export const MODULE = 'demo';

// Optional 'NAVS' object
export const NAVS = [
  {
    route: { path: '/demoBox1', component: DemoBox1Page },
    link: { path: '/demo/box1', order: 5 }
  },
  {
    route: { path: '/demoBox2', component: DemoBox2Page },
    link: { path: '/demo/box2', order: 7 }
  },
  {
    route: { path: '/demoIcon', component: DemoIconPage },
    link: { path: '/demo/icon', order: 10 }
  },
  {
    route: { path: '/demoColor', component: DemoColorPage },
    link: { path: '/demo/color', order: 20 }
  },
  {
    route: { path: '/demoHeader', component: DemoHeaderPage },
    link: { path: '/demo/header', order: 30 }
  },
  {
    route: { path: '/demoTable', component: DemoTablePage },
    link: { path: '/demo/table', order: 40 }
  },
  {
    route: { path: '/demoDataGridPage', component: DemoDataGridPage },
    link: { path: '/demo/dataGrid', order: 50 }
  },
  {
    route: { path: '/demoDataGridSmallPage', component: DemoDataGridSmallPage },
    link: { path: '/demo/dataGridSmall', order: 60 }
  },
  {
    route: { path: '/demoButtonPage', component: DemoButtonPage },
    link: { path: '/demo/button', order: 70 }
  },
  {
    route: { path: '/demoForm', component: DemoFormPage },
    link: { path: '/demo/form', order: 80 }
  },
  {
    route: { path: '/demoLayer', component: DemoLayerPage },
    link: { path: '/demo/layer', order: 90 }
  },
  {
    route: { path: '/demoMetric', component: DemoMetricPage },
    link: { path: '/demo/metric', order: 100 }
  },
];

const DEMO_FETCH_REQUEST = `${MODULE}/FETCH_REQUEST`;
const DEMO_FETCH_FAILURE = `${MODULE}/FETCH_FAILURE`;
const DEMO_FETCH_SUCCESS = `${MODULE}/FETCH_SUCCESS`;

// Optional 'ACTIONS' object
export const ACTIONS = {

  fetchRequest() {
    return { type: DEMO_FETCH_REQUEST };
  },

  fetchFailure(url, error) {
    return { type: DEMO_FETCH_FAILURE, url, error };
  },

  fetchSuccess(resp) {
    return { type: DEMO_FETCH_SUCCESS, resp };
  },

  fetchIfNeeded() {
    return (dispatch, getState) => {
      if (ACTIONS.shouldFetch(getState())) {
        return dispatch(ACTIONS.fetch());
      }
    };
  },

  shouldFetch(state) {
    return state || true; // hide state warning;
  },

  fetch() {
    return dispatch => {
      dispatch(ACTIONS.fetchRequest());
      dispatch(ACTIONS.fetchSuccess({}));
    };
  },

};

const INITIAL_STATE = {
  isFetching: false,
  lastUpdate: 0,
  lastError: null,
  entities: {},
};

// Optional 'reducer' function
export function reducer(moduleState = INITIAL_STATE, action) {
  switch (action.type) {

    case DEMO_FETCH_REQUEST:
      return { ...moduleState, isFetching: true };

    case DEMO_FETCH_FAILURE:
      return { ...moduleState, isFetching: false, lastError: action.error };

    case DEMO_FETCH_SUCCESS:
      const entities = {
        '1': { id: 1, text: 'Item 1' },
        '2': { id: 2, text: 'This 2' },
        '3': { id: 3, text: 'This 3' },
        '4': { id: 4, text: 'Item 4' },
        '5': { id: 5, text: 'This 5' },
        '6': { id: 6, text: 'This 6' },
        '7': { id: 7, text: 'Item 7' },
        '8': { id: 8, text: 'This 8' },
        '9': { id: 9, text: 'This 9' },
        '10': { id: 10, text: 'Item 10' },
        '11': { id: 11, text: 'Item 11' },
        '12': { id: 12, text: 'This 12' },
        '13': { id: 13, text: 'This 13' },
        '14': { id: 14, text: 'Item 14' },
        '15': { id: 15, text: 'This 15' },
        '16': { id: 16, text: 'This 16' },
        '17': { id: 17, text: 'Item 17' },
        '18': { id: 18, text: 'This 18' },
        '19': { id: 19, text: 'This 19' },
      };
      return {
        ...moduleState,
        isFetching: false,
        lastUpdate: Date.now(),
        entities,
      };

    default:
      return moduleState;
  }
}
