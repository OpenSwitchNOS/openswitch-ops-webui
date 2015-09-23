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
 * Actions for VLANs Mgmt view
 */

var Reflux = require('reflux'),
    RestUtils = require('restUtils'),
    RenderActions = require('RenderActions');

var VlanMgmtActions = Reflux.createActions({
    loadVlans: { asyncResult: true },
    toggleVlanDisplay: {},
    setSelectedVlan: {},
    addPortToVlan: {},
    removePortFromVlan: {},
    saveVlanConfig: {},
    showPortDetails: {},
    closePortDetails: {},
    resetStore: {}
});

//Request all VLANs
VlanMgmtActions.loadVlans.listen(function() {

    var requests = [
        '/rest/v1/system/bridges/bridge_normal/vlans',
        '/rest/v1/system/bridges/bridge_normal/ports'
    ];

    RestUtils.get(requests, function(e1, r1) {
        if (e1) {
            this.failed(e1);
        } else {
            RestUtils.get([ r1[0].body, r1[1].body ], function(e2, r2) {
                if (e2) {
                    this.failed(e2);
                } else {
                    this.completed(r2);
                }
            }.bind(this));
        }
    }.bind(this));
});

VlanMgmtActions.loadVlans.failed.listen(function(e) {
    RenderActions.postRequestErr(e);
});

module.exports = VlanMgmtActions;
