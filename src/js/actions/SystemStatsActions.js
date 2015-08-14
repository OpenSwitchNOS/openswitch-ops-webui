/*
 * Actions for System statistics (frequently changes).
 * @author Frank Wood
 */

var Reflux = require('reflux'),
    Request = require('superagent');

var SystemStatsActions = Reflux.createActions({
    // Actions: load, loadFailed, loadCompleted
    load: { asyncResult: true },
});

SystemStatsActions.load.listen(function() {
    Request.get('/ui/sysstats').end(function(err, res) {
        if (err) {
            this.failed(err); // Callback action: loadFailed
        } else {
            this.completed(res.body); // Callback action: loadCompleted
        }
    }.bind(this));
});

module.exports = SystemStatsActions;
