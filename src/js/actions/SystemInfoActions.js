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
 * Actions for System information (rarely changes).
 */

var Reflux = require('reflux'),
    RestUtils = require('restUtils'),
    RenderActions = require('RenderActions');

var SystemInfoActions = Reflux.createActions({
    load: { asyncResult: true },
});

SystemInfoActions.load.listen(function() {

    RestUtils.get([
        '/rest/v1/system/subsystems/base',
        '/rest/v1/system'
    ], function(err, res) {
        var otherInfo;
        if (err) {
            this.failed(err);
        } else {
            otherInfo = res[0].body.status.other_info;
            this.completed({
                onieVersion: otherInfo.onie_version,
                baseMac: otherInfo.base_mac_address.toUpperCase(),
                serialNum: otherInfo.serial_number,
                vendor: otherInfo.vendor,
                productName: otherInfo['Product Name'],
                partNum: otherInfo.part_number,
                version: res[1].body.status.switch_version,
                hostName: res[1].body.configuration.hostname
            });
        }
    }.bind(this));

});

SystemInfoActions.load.failed.listen(function(err) {
    RenderActions.postRequestErr(err);
});

module.exports = SystemInfoActions;
