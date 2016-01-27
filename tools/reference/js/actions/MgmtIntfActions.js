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
 * Actions for Management Interface.
 */

var Reflux = require('reflux'),
    RestUtils = require('restUtils'),
    RenderActions = require('RenderActions'),
    IpSubnetCalc = require('ip-subnet-calculator');

var MgmtIntfActions = Reflux.createActions({
    load: { asyncResult: true },
});

MgmtIntfActions.load.listen(function() {

    RestUtils.get('/rest/v1/system', function(err, res) {
        var result = {};
        if (err) {
            this.failed(err);
        } else {
            var mgmtIntf = res.body.configuration.mgmt_intf;
            if ( mgmtIntf.name ) {
                result.name = mgmtIntf.name;
            }
            // chance that 'mode' could not exist, which is defaulted to 'dhcp'
            if ( mgmtIntf.mode ) {
                if ( mgmtIntf.mode === 'static' ) {
                    result.mode = 'static';
                    if ( mgmtIntf.ip ) {
                        result.ip = mgmtIntf.ip;
                        if ( mgmtIntf.subnet_mask ) {
                            if (mgmtIntf.subnet_mask.length <= 2) {
                                result.subnetMask =
                                    IpSubnetCalc.calculateSubnetMask(
                                        mgmtIntf.ip,
                                        Number(mgmtIntf.subnet_mask)
                                    ).prefixMaskStr;
                            } else {
                                result.subnetMask = mgmtIntf.subnet_mask;
                            }
                        }
                    }
                    if ( mgmtIntf.default_gateway ) {
                        result.defaultGateway = mgmtIntf.default_gateway;
                    }
                    if ( mgmtIntf.ipv6 ) {
                        result.ipv6 = mgmtIntf.ipv6;
                    }
                    if ( mgmtIntf.dns_server1 ) {
                        result.dnsServer1 = mgmtIntf.dns_server1;
                    }
                    if ( mgmtIntf.dns_server2 ) {
                        result.dnsServer2 = mgmtIntf.dns_server2;
                    }
                } else {
                    result.mode = 'dhcp';
                }
            }
            this.completed(result);
        }
    }.bind(this));
});

MgmtIntfActions.load.failed.listen(function(err) {
    RenderActions.postRequestErr(err);
});

module.exports = MgmtIntfActions;
