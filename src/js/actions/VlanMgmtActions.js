/*
 * Actions for VLANs Mgmt view
 * @author Kelsey Dedoshka
 */

var Reflux = require('reflux'),
    RestUtils = require('restUtils'),
    RenderActions = require('RenderActions');

var VlanMgmtActions = Reflux.createActions({
    // Create the actions:
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
        '/system/bridges/bridge_normal/vlans',
        '/system/bridges/bridge_normal/ports'
    ];

    RestUtils.get(requests, function(err, res) {
        if (err) {
            this.failed(err);
        } else {
            var dataRequests = [];
            for (var i=0; i<res.length; i++) {
                var urls = res[i].data;
                for (var j=0; j<urls.length; j++) {
                    dataRequests.push(urls[j]);
                }
            }

            RestUtils.get(dataRequests, function(err2, res2) {
                if (err) {
                    this.failed(err2);
                } else {
                    this.completed(res2);
                }
            }.bind(this));
        }
    }.bind(this));
});

//Fail handler for loading vlans
VlanMgmtActions.loadVlans.failed.listen(function(e) {
    RenderActions.postRequestErr(e);
});

module.exports = VlanMgmtActions;
