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

import ReferenceDataGridRouteContainer
  from './referenceDataGridRouteContainer.jsx';
import ReferenceToolbarRouteContainer
  from './referenceToolbarRouteContainer.jsx';
import ReferenceBoxContainerRouteContainer
  from './referenceBoxContainerRouteContainer.jsx';
import ReferenceBoxIconRouteContainer
  from './referenceBoxIconRouteContainer.jsx';

// Required 'MODULE' name
export const MODULE = 'reference';

// Optional 'NAVS' object
export const NAVS = [
  {
    route: { path: '/refDg', component: ReferenceDataGridRouteContainer },
    link: { path: '/reference/dataGrid', order: 90 }
  },
  {
    route: { path: '/refTb', component: ReferenceToolbarRouteContainer },
    link: { path: '/reference/toolbar', order: 91 }
  },
  {
    route: { path: '/refBc', component: ReferenceBoxContainerRouteContainer },
    link: { path: '/reference/boxContainer', order: 92 }
  },
  {
    route: { path: '/refBi', component: ReferenceBoxIconRouteContainer },
    link: { path: '/reference/boxIcon', order: 93 }
  },
];

const REFERENCE_FETCH_REQUEST = `${MODULE}/FETCH_REQUEST`;
const REFERENCE_FETCH_FAILURE = `${MODULE}/FETCH_FAILURE`;
const REFERENCE_FETCH_SUCCESS = `${MODULE}/FETCH_SUCCESS`;

// Optional 'ACTIONS' object
export const ACTIONS = {

  fetchRequest() {
    return { type: REFERENCE_FETCH_REQUEST };
  },

  fetchFailure(url, error) {
    return { type: REFERENCE_FETCH_FAILURE, url, error };
  },

  fetchSuccess(resp) {
    return { type: REFERENCE_FETCH_SUCCESS, resp };
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

    case REFERENCE_FETCH_REQUEST:
      return { ...moduleState, isFetching: true };

    case REFERENCE_FETCH_FAILURE:
      return { ...moduleState, isFetching: false, lastError: action.error };

    case REFERENCE_FETCH_SUCCESS:
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
