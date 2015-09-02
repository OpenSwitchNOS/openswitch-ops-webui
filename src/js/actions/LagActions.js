/*
 * Actions for LAG.
 * @author Frank Wood
 */

// TODO: make action file names consistent with stores (Port vs Ports).

var Reflux = require('reflux'),
    RestUtils = require('restUtils'),
    RenderActions = require('RenderActions');

var LagActions = Reflux.createActions({
    loadLags: { asyncResult: true },
    loadInterfaces: { asyncResult: true },
});

function processConfig(data) {
    if (Object.keys(data.lacp_config).length > 0) {
        return {
            sysId: data.lacp_config.lacp_system_id,
            sysPri: data.lacp_config.lacp_system_priority
        };
    }
    return {};
}

function lacpPortVal(data) {
    var lacpVal;
    if (data.lacp && data.lacp.length > 0) {
        lacpVal = data.lacp[0];
        if (lacpVal === 'off' || lacpVal === 'active' ||
                lacpVal === 'passive') {
            return lacpVal;
        }
    }
    return null;
}

function processPorts(ports) {
    var result = [], data, lacpVal;
    for (var i=0; i<ports.length; i++) {
        data = ports[i].data;
        lacpVal = lacpPortVal(data);
        if (lacpVal) {
            result.push({
                name: data.name,
                mode: lacpVal,
                bondSpeed: data.lacp_status.bond_speed,
                bondStatusReason: data.lacp_status.bond_status_reason,
                bondStatus: data.lacp_status.bond_status,
                infUrl: data.interfaces
            });
        }
    }
    return result;
}

LagActions.loadLags.listen(function() {

    RestUtils.get([
        '/system',
        '/system/bridges/bridge_normal/ports'
    ], function(e1, r1) {
        if (e1) {
            this.failed(e1);
        } else {
            RestUtils.get(r1[1].data, function(e2, r2) {
                if (e2) {
                    this.failed(e2);
                } else {
                    this.completed({
                        config: processConfig(r1[0].data),
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

function processInfs(infs) {
    var result = [], ri, data, s;
    for (var i=0; i<infs.length; i++) {
        ri = {};

        data = infs[i].data;

        ri.name = data.name;
        ri.mac = data.hw_intf_info.mac_addr.toUpperCase();
        ri.macInUse = macInUse(data);

        if (Object.keys(data.lacp_status).length > 0) {
            s = data.lacp_status;
            ri.lacpCurrent = data.lacp_current[0];
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
            RestUtils.get(r1.data, function(e2, r2) {
                if (e2) {
                    this.failed(e2);
                } else {
                    this.completed(lag, processInfs(r2));
                }
            }.bind(this));
        }
    }.bind(this));

});

LagActions.loadInterfaces.failed.listen(function(e) {
    RenderActions.postRequestErr(e);
});

module.exports = LagActions;
