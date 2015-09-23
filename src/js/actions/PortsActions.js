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
 * Actions for Port Store.
 */

var Reflux = require('reflux'),
    RestUtils = require('restUtils'),
    RenderActions = require('RenderActions');

var PortsActions = Reflux.createActions({
    loadPorts: { asyncResult: true },
});

PortsActions.loadPorts.listen(function() {
    RestUtils.get('/rest/v1/system/interfaces', function(e1, r1) {
        if (e1) {
            this.failed(e1);
        } else {
            RestUtils.get(r1.body, function(e2, r2) {
                var port, ports = [];
                if (e2) {
                    this.failed(e2);
                } else {
                    for (var i=0; i<r2.length; i++) {
                        port = r2[i].body;
                        // system as type means it is a port
                        if (port.configuration.type === 'system') {
                            ports.push(port);
                        }
                    }
                    this.completed(ports);
                }
            }.bind(this));
        }
    }.bind(this));
});

PortsActions.loadPorts.failed.listen(function(e) {
    RenderActions.postRequestErr(e);
});

module.exports = PortsActions;
