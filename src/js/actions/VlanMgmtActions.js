/*
 * Actions for VLANs Mgmt view
 * @author Kelsey Dedoshka
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
