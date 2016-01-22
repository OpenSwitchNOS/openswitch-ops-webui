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

import Dux from 'dux.js';

import DemoBox1Page from './demoBox1Page.jsx';
import DemoBox2Page from './demoBox2Page.jsx';
import DemoBox3Page from './demoBox3Page.jsx';
import DemoBoxDataGridPage from './demoBoxDataGridPage.jsx';
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

const NAME = 'demo';

let order = 1000;

const NAVS = [
  {
    route: { path: '/demoBox1', component: DemoBox1Page },
    link: { path: '/demo/box1', order: order++ }
  },
  {
    route: { path: '/demoBox2', component: DemoBox2Page },
    link: { path: '/demo/box2', order: order++ }
  },
  {
    route: { path: '/demoBox3', component: DemoBox3Page },
    link: { path: '/demo/box3', order: order++ }
  },
  {
    route: { path: '/demoBoxDataGrid', component: DemoBoxDataGridPage },
    link: { path: '/demo/boxDataGrid', order: order++ }
  },
  {
    route: { path: '/demoIcon', component: DemoIconPage },
    link: { path: '/demo/icon', order: order++ }
  },
  {
    route: { path: '/demoColor', component: DemoColorPage },
    link: { path: '/demo/color', order: order++ }
  },
  {
    route: { path: '/demoHeader', component: DemoHeaderPage },
    link: { path: '/demo/header', order: order++ }
  },
  {
    route: { path: '/demoTable', component: DemoTablePage },
    link: { path: '/demo/table', order: order++ }
  },
  {
    route: { path: '/demoDataGridPage', component: DemoDataGridPage },
    link: { path: '/demo/dataGrid', order: order++ }
  },
  {
    route: { path: '/demoDataGridSmallPage', component: DemoDataGridSmallPage },
    link: { path: '/demo/dataGridSmall', order: order++ }
  },
  {
    route: { path: '/demoButtonPage', component: DemoButtonPage },
    link: { path: '/demo/button', order: order++ }
  },
  {
    route: { path: '/demoForm', component: DemoFormPage },
    link: { path: '/demo/form', order: order++ }
  },
  {
    route: { path: '/demoLayer', component: DemoLayerPage },
    link: { path: '/demo/layer', order: order++ }
  },
  {
    route: { path: '/demoMetric', component: DemoMetricPage },
    link: { path: '/demo/metric', order: order++ }
  },
];

const ACTIONS = {
  fetch() {
    const ACTION_TYPES = Dux.fetchActionTypes(NAME);
    return (dispatch) => {
      dispatch({ type: ACTION_TYPES.REQUEST });
      dispatch({ type: ACTION_TYPES.SUCCESS });
    };
  }
};

const INITIAL_STORE = {
  entities: {},
};

function parseResult() {
  const entities = {};
  for (let i=1; i<=30; i++) {
    entities[`${i}`] = { id: i, text: `This is item ${i}` };
  }
  return { entities };
}

const REDUCER = Dux.fetchReducer(NAME, INITIAL_STORE, parseResult);

export default {
  NAME,
  NAVS,
  ACTIONS,
  REDUCER,
};
