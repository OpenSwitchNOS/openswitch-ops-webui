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

// Encapsulates the creation of the navigation model tree from the provided
// build configuration. The actual navigation items (groups and Links) are not
// created here.

import React from 'react';
import { Route, IndexRoute } from 'react-router';
import { navt } from 'i18n/lookup.js';


const DEFAULT_ROUTE = 'overview';

function mkRouteDescNode(component) {
  return { component };
}

function mkLinkGroupDescNode() {
  return { };
}

function mkLinkDescNode(route, link) {
  return { route, link };
}

function processRouteDesc(navModelRoutes, routeDesc) {
  const path = routeDesc.path;
  const p = path && path.charAt(0) === '/' ? path.substr(1) : path;
  const pathArray = p.split('/');
  let key = pathArray[0];
  if (pathArray.length > 1) {
    key = pathArray.slice(1).join('/');
  }
  let parent = navModelRoutes;
  pathArray.forEach(pathPart => parent = parent[pathPart] || parent);
  parent[key] = mkRouteDescNode(routeDesc.component);
}

function processLinkDesc(navModelLinks, navDesc) {
  const path = navDesc.link.path;
  const p = path && path.charAt(0) === '/' ? path.substr(1) : path;
  const pathArray = p.split('/');
  const key = pathArray.pop();

  let parent = navModelLinks;
  pathArray.forEach(pathPart => {
    let nextParent = parent[pathPart];
    if (!nextParent) {
      nextParent = parent[pathPart] = mkLinkGroupDescNode();
    }
    parent = nextParent;
  });

  parent[key] = mkLinkDescNode(navDesc.route.path, navDesc.link);
}

export function createNavModel(BuildConfig, rootComponent) {
  const navModel = {
    routes: mkRouteDescNode(rootComponent),
    links: mkLinkGroupDescNode(),
    routeToLink: {},
  };

  BuildConfig.modules.forEach(m => {
    if (m.NAVS) {
      m.NAVS.forEach(i => {
        processRouteDesc(navModel.routes, i.route);
        if (!i.link.hidden) {
          processLinkDesc(navModel.links, i);
        }
        navModel.routeToLink[i.route.path] = i.link.path;
      });
    }
  });

  return navModel;
}

// Recursively generate the <Route .../> element tree from the nav model.

function mkChildRouteElements(subModel, key) {
  const children = [];
  Object.getOwnPropertyNames(subModel).forEach(k => {
    if (k !== 'component') {
      children.push(mkChildRouteElements(subModel[k], k));
      if (k === DEFAULT_ROUTE) {
        children.push(<IndexRoute component={subModel[k].component} />);
      }
    }
  });
  const props = { key, path: key, component: subModel.component, children };
  return <Route { ...props } name={navt(key)} />;
}

export function createRouteElements(navModel) {
  return mkChildRouteElements(navModel.routes, '/');
}
