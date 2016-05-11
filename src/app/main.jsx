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

// The main component that is rendered by 'index.jsx'.

import React, { Component } from 'react';
import Router from 'react-router';
import {
  applyMiddleware,
  createStore,
  combineReducers,
  bindActionCreators
} from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { Provider } from 'react-redux';

import { createNavModel, createRouteElements } from './navModel.jsx';
import { setLocale } from 'i18n/lookup.js';
import { agentInit } from 'agent.js';

import NavDux from 'framework/navDux.jsx';
import ToolbarDux from 'framework/toolbarDux.jsx';
import AuthDux from 'framework/authDux.jsx';
import GuideDux from 'framework/guideDux.jsx';

import MainApp from './mainApp.jsx';

let store;
let actions;
let autoActions;
let routes;

// Based on the modules loaded by the BuildConfig, we look for the well known
// 'MODULE' string and 'reducer' function, and create a combined object of
// reducers that is later given to the Redux framework.

function createReducers(BuildConfig) {
  const modules = BuildConfig.modules;
  const reducers = {
    links: (moduleStore = {}) => { return moduleStore; },
    routeToLink: (moduleStore = {}) => { return moduleStore; },
    guides: (moduleStore = {}) => { return moduleStore; },
    settings: (moduleStore = {}) => { return moduleStore; },
  };
  modules.forEach(i => reducers[i.NAME] = i.REDUCER);
  return combineReducers(reducers);
}

// Based on the modules loaded by the BuildConfig, we look for the well known
// 'MODULE' string and 'ACTIONS' object, and create a combinded object that we
// later inject into each route component.

function createActions(BuildConfig, s) {
  const modules = BuildConfig.modules;
  const result = {};
  modules.forEach(i => {
    if (i.ACTIONS) {
      result[i.NAME] = bindActionCreators(i.ACTIONS, s.dispatch);
    }
  });
  return result;
}

// Based on the modules loaded by the BuildConfig, we look for the well known
// 'MODULE' string and 'AUTO_ACTIONS' object, and create a combinded object
// that we later call periodically in the background.

function createAutoActions(BuildConfig, s) {
  const modules = BuildConfig.modules;
  const result = {};
  modules.forEach(i => {
    if (i.AUTO_ACTIONS) {
      result[i.NAME] = bindActionCreators(i.AUTO_ACTIONS, s.dispatch);
    }
  });
  return result;
}

// Boilerplate code to create the combined reducers (Redux) and the store
// with all necessary middleware (middleware is a fancy term for plugging in
// to the Redux handling of actions and store updates).

function createReducersAndStore(BuildConfig, initStore) {
  const reducers = createReducers(BuildConfig);
  let createStoreFn = null;
  if (BuildConfig.settings.reduxLogger) {
    createStoreFn =
      applyMiddleware(thunkMiddleware, createLogger())(createStore);
  } else {
    createStoreFn =
      applyMiddleware(thunkMiddleware)(createStore);
  }
  return createStoreFn(reducers, initStore);
}

// Entry point called by index.jsx. The BuildConfig is passed as a parameter
// so that we can configure the app based on settings and the provided
// links from each module.

export function mainInit(BuildConfig) {
  setLocale(BuildConfig.settings.i18nLocale);
  agentInit(BuildConfig.settings.agent);

  BuildConfig.modules.splice(0, 0, NavDux);
  BuildConfig.modules.splice(0, 0, ToolbarDux);
  BuildConfig.modules.splice(0, 0, AuthDux);
  BuildConfig.modules.splice(0, 0, GuideDux);

  const navModel = createNavModel(BuildConfig, MainApp);
  const initStore = {
    links: navModel.links,
    routeToLink: navModel.routeToLink,
    guides: BuildConfig.guides || [],
    settings: BuildConfig.settings || {},
  };

  store = createReducersAndStore(BuildConfig, initStore);
  actions = createActions(BuildConfig, store);
  autoActions = createAutoActions(BuildConfig, store);
  routes = createRouteElements(navModel);
}

// The Main component that connectes the Redux store to all the routes. We also
// provide a createElement handler so that we can inject all action functions.
// Any route component will have 'this.props.actions.<module>.<fn>' available.

function createElement(RouteComponent, props) {
  return (
    <RouteComponent {...props} actions={actions} autoActions={autoActions} />
  );
}

export default class Main extends Component {
  render() {
    return (
      <div>
        <Provider store={store}>
          <Router routes={routes} createElement={createElement}/>
        </Provider>
      </div>
    );
  }
}
