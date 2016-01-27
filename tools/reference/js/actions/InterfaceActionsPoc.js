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
 * Actions for interfaces (frequently changes).
 */

// TODO: make action file names consistent with stores (Port vs Ports).

var Reflux = require('reflux'),
    RestUtils = require('restUtils'),
    RenderActions = require('RenderActions');

var InterfaceActionsPoc = Reflux.createActions({
    load: { asyncResult: true },
});

function processResponse(res) {
    var intfs = [], intf, stats;
    for (var i=0; i<res.body.length; i++) {
        intf = res.body[i];
        if (intf.configuration.type === 'system') {
            stats = intf.statistics.statistics;
            intfs.push({
                link: intf.status.link_state,
                duplex: intf.status.duplex,
                speed: Number(intf.status.link_speed),
                name: intf.configuration.name,
                rxBytes: Number(stats.rx_bytes),
                txBytes: Number(stats.tx_bytes)
            });
        }
    }
    return intfs;
}

InterfaceActionsPoc.load.listen(function() {
    var url = '/rest-poc/v1/system/interfaces?admin_state=up;link_state=up';

    RestUtils.get(url, function(e1, r1) {
        if (e1) {
            this.failed(e1);
        } else {
            this.completed(processResponse(r1));
        }
    }.bind(this));
});

InterfaceActionsPoc.load.failed.listen(function(e) {
    RenderActions.postRequestErr(e);
});

module.exports = InterfaceActionsPoc;
