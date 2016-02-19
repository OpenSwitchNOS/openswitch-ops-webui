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

import InterfaceData from './interfaceData.js';


export default class InterfaceCache {

  constructor() {
    this._entities = {};
  }

  getOrCreateInterface(id, speed, duplex) {
    let entity = this._entities[id];
    if (entity && !entity.isMetricStillValid(speed, duplex)) {
      entity = null;
    }
    if (!entity) {
      this._entities[id] = entity = new InterfaceData(id, speed, duplex);
    }
    return entity;
  }

  entity = (id) => this._entities[id];

  size = () => Object.keys(this._entities).length;

  metrics = (ts) => {
    const all = {};
    const top = [];
    Object.getOwnPropertyNames(this._entities).forEach(k => {
      const ent = this._entities[k];
      const grp = [];
      ent.metrics().forEach((m, i) => {
        if (m.size() > 0 && ts <= ent.lastUpdate(i)) {
          grp.push(m);
          top.push(m);
        }
      });
      if (grp.length > 0) {
        all[k] = grp;
      }
    });
    top.sort((m1, m2) => {
      let n = m2.latestDataPoint().value() - m1.latestDataPoint().value();
      if (n !== 0) { return n; }
      n = m1.getGroup().localeCompare(m2.getGroup());
      if (n !== 0) { return n; }
      return m1.getName().localeCompare(m2.getName());
    });
    return { all, top };
  };

}
