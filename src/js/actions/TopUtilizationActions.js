/*
 * Actions for Top Utilization  on ports, VLANS, etc. (frequently changes).
 * @author Frank Wood
 */

var Reflux = require('reflux'),
    RestUtils = require('restUtils');

var TopUtilizationActions = Reflux.createActions({
    // Actions: load, loadFailed, loadCompleted
    load: { asyncResult: true },
});

TopUtilizationActions.load.listen(function() {
    RestUtils.get(['/ui/ports', '/ui/vlans'], function(err, resBody) {
        if (err) {
            this.failed(err); // Callback action: loadFailed
        } else {
            this.completed(resBody); // Callback action: loadCompleted
        }
    }.bind(this));
});

module.exports = TopUtilizationActions;
