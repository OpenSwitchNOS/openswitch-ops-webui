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


export default class Translater {

  constructor(mappings) {
    this._mappings = mappings;
  }

  from(key, val) {
    const map = this._mappings[key];
    if (map) {
      let mapVal = map[val];
      if (!mapVal) {
        mapVal = map.DEFAULT && map[map.DEFAULT];
      }
      return mapVal || 'unknown';
    }
    return 'unknown';
  }

  clearDefaults(data) {
    const result = { ...data };
    Object.getOwnPropertyNames(data).forEach(key => {
      const val = data[key];
      const map = this._mappings[key];
      if (map && map.DEFAULT && map[map.DEFAULT] === val) {
        delete result[key];
      }
    });
    return result;
  }

}
