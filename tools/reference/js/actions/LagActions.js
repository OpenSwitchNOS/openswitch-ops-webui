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
 * Actions for LAG.
 */

// TODO: make action file names consistent with stores (Port vs Ports).

var Reflux = require('reflux'),
    RestUtils = require('restUtils'),
    RenderActions = require('RenderActions');

var LagActions = Reflux.createActions({
    loadLags: { asyncResult: true },
    loadInterfaces: { asyncResult: true },
});

function processConfig(res) {
    var cfg = res.body.configuration;

    if (Object.keys(cfg.lacp_config).length > 0) {
        return {
            sysId: cfg.lacp_config.lacp_system_id,
            sysPri: cfg.lacp_config.lacp_system_priority
        };
    }
    return {};
}

function lacpPortVal(portCfg) {
    var lacpVal = portCfg.lacp;
    if (lacpVal &&
        lacpVal === 'off' ||
        lacpVal === 'active' ||
        lacpVal === 'passive') {

        return lacpVal;
    }
    return null;
}

function processPorts(res) {
    var result = [], portCfg, portStatus, lacpVal;
    for (var i=0; i<res.length; i++) {
        portCfg = res[i].body.configuration;
        portStatus = res[i].body.status;
        lacpVal = lacpPortVal(portCfg);
        if (lacpVal) {
            result.push({
                name: portCfg.name,
                mode: lacpVal,
                bondSpeed: portStatus.lacp_status.bond_speed,
                bondStatusReason: portStatus.lacp_status.bond_status_reason,
                bondStatus: portStatus.lacp_status.bond_status,
                infUrl: portCfg.interfaces
            });
        }
    }
    return result;
}

LagActions.loadLags.listen(function() {

    RestUtils.get([
        '/rest/v1/system',
        '/rest/v1/system/bridges/bridge_normal/ports'
    ], function(e1, r1) {
        if (e1) {
            this.failed(e1);
        } else {
            RestUtils.get(r1[1].body, function(e2, r2) {
                if (e2) {
                    this.failed(e2);
                } else {
                    this.completed({
                        config: processConfig(r1[0]),
                        lags: processPorts(r2)
                    });
                }
            }.bind(this));
        }
    }.bind(this));

});

LagActions.loadLags.failed.listen(function(e) {
    RenderActions.postRequestErr(e);
});

function macInUse(data) {
    if (data.mac_in_use && data.mac_in_use.length > 0) {
        return data.mac_in_use[0].toUpperCase();
    }
    return null;
}

function processInfs(res) {
    var result = [], ri, cfg, status, s;
    for (var i=0; i<res.length; i++) {
        ri = {};
        cfg = res[i].body.configuration;
        status = res[i].body.status;

        ri.name = cfg.name;
        ri.mac = status.hw_intf_info.mac_addr.toUpperCase();
        ri.macInUse = macInUse(status);

        if (Object.keys(status.lacp_status).length > 0) {
            ri.lacpCurrent = status.lacp_current[0];
            s = status.lacp_status;
            ri.partnerKey = s.partner_key;
            ri.partnerState = s.partner_state;
            ri.partnerPortId = s.partner_port_id;
            ri.partnerSysId = s.partner_system_id;
            ri.actorKey = s.actor_key;
            ri.actorState = s.actor_state;
            ri.actorPortId = s.actor_port_id;
            ri.actorSysId = s.actor_system_id;
        }

        result.push(ri);
    }
    return result;
}

LagActions.loadInterfaces.listen(function(lag) {

    RestUtils.get(lag.infUrl, function(e1, r1) {
        if (e1) {
            this.failed(e1);
        } else {
            this.completed(lag, processInfs(r1));
        }
    }.bind(this));

});

LagActions.loadInterfaces.failed.listen(function(err, res) {
    RenderActions.postRequestErr(err, res);
});

module.exports = LagActions;
