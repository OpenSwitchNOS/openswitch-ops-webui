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

/*eslint no-console:0*/

import defaults from 'superagent-defaults';

const Agent = defaults();

export function agentInit(settings) {
  const prefix = settings && (settings.prefix || '');
  if (prefix) {
    console.log(`Agent request prefix: ${prefix}`);
  }
  Agent
    // .auth(..., ...) <- user, pwd
    // .set(..., ...) <- headers
    .on('request', (req) => {
      if (req.url[0] === '/') {
        req.url = prefix + req.url;
      }
    });
}

export default Agent;
