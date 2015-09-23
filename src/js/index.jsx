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

/*
 * Main entry point for loading modules.
 */

// Include the main style sheet.
require('../scss/index.scss');

// Include support for FontAwesome icons.
// TODO: investigation if all font-awesome files are needed?
require('font-awesome-webpack');

// Bootstrap the router (runs our application).
require('router');
