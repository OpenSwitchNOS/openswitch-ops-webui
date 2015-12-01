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
import App from './app.jsx';
import { createNavModel, createRouteElements } from './navModel.jsx';

import { setLocale } from 'i18n/lookup.js';
import * as navDescriptor from 'framework/navDux.jsx';
import * as screenDescriptor from 'framework/screenDux.jsx';

let store;
let actions;
let routes;

function createReducers(BuildConfig) {
  const modules = BuildConfig.modules;
  const reducers = { links: (state = {}) => { return state; } };
  modules.forEach(i => reducers[i.MODULE] = i.reducer);
  return combineReducers(reducers);
}

function createActions(BuildConfig, s) {
  const modules = BuildConfig.modules;
  const result = {};
  modules.forEach(i => {
    if (i.ACTIONS) {
      result[i.MODULE] = bindActionCreators(i.ACTIONS, s.dispatch);
    }
  });
  return result;
}

function createReducersAndStore(BuildConfig, initStore) {
  const reducers = createReducers(BuildConfig);
  if (BuildConfig.settings.reduxLogger) {
    const createStoreFn = applyMiddleware(
      thunkMiddleware,
      createLogger()
    )(createStore);
    return createStoreFn(reducers, initStore);
  }
  return createStore(reducers, initStore);
}

export function mainInit(BuildConfig) {
  setLocale(BuildConfig.settings.i18nLocale);

  BuildConfig.modules.splice(0, 0, screenDescriptor);
  BuildConfig.modules.splice(0, 0, navDescriptor);

  const navModel = createNavModel(BuildConfig, App);
  const initStore = { links: navModel.links };

  store = createReducersAndStore(BuildConfig, initStore);
  actions = createActions(BuildConfig, store);
  routes = createRouteElements(navModel);
}

function createElement(RouteComponent, props) {
  return <RouteComponent {...props} actions={actions} />;
}

export default class Main extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router createElement={createElement}>
          {routes}
        </Router>
      </Provider>
    );
  }
}
