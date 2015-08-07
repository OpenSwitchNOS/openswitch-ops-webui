/*
 * Actions for VLANs.
 * @author Frank Wood
 */

var Reflux = require('reflux'),
    Request = require('superagent');

var VlansActions = Reflux.createActions({
    // Create the actions:
    //  loadVlans, loadVlansFailed, loadVlansCompleted
    loadVlans: { asyncResult: true },
    toggleVlanDisplay: {},
    setSelectedVlan: {},
    addPortToVlan: {},
    removePortFromVlan: {},
    saveVlanConfig: {}

});

// Self-handle the 'loadVlans' action by requesting server data.
VlansActions.loadVlans.listen(function() {
    Request.get('/ui/vlans').end(function(err, res) {
        if (err) {
            this.failed(err); // Action: loadVlansFailed
        } else {
            this.completed(res.body); // Action: loadVlansCompleted
        }
    }.bind(this));
});

module.exports = VlansActions;
