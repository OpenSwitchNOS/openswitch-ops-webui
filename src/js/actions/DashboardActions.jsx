/*
 * Actions for the Dashboard view.
 * @author Frank Wood
 */

var Reflux = require('reflux'),
    Request = require('superagent');

var DashboardActions = Reflux.createActions({
    // Actions: load, loadFailed, loadCompleted
    loadSysInfo: { asyncResult: true }
});

DashboardActions.loadSysInfo.listen(function() {
    Request.get('/ui/sysinfo').end(function(err, res) {
        if (err) {
            this.failed(err); // Callback action: loadFailed
        } else {
            this.completed(res.body); // Callback action: loadCompleted
        }
    }.bind(this));
});

module.exports = DashboardActions;
