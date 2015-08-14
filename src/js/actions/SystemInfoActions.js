/*
 * Actions for System information (rarely changes).
 * @author Frank Wood
 */

var Reflux = require('reflux'),
    Request = require('superagent');

var SystemInfoActions = Reflux.createActions({
    // Actions: load, loadFailed, loadCompleted
    load: { asyncResult: true },
});

SystemInfoActions.load.listen(function() {
    Request.get('/ui/sysinfo').end(function(err, res) {
        if (err) {
            this.failed(err); // Callback action: loadFailed
        } else {
            this.completed(res.body); // Callback action: loadCompleted
        }
    }.bind(this));
});

module.exports = SystemInfoActions;
