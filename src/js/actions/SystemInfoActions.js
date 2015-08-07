/*
 * Actions for SystemInfo.
 * @author Frank Wood
 */

var Reflux = require('reflux'),
    Request = require('superagent');

var SystemInfoActions = Reflux.createActions({
    // Actions: load, loadFailed, loadCompleted
    load: { asyncResult: true },
    // Actions: submit, submitFailed, submitCompleted
    submit: { asyncResult: true }
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

SystemInfoActions.submit.listen(function(data) {
    Request.post('/ui/sysinfo').send(data).end(function(err) {
        if (err) {
            this.failed(err); // Callback action: submitFailed
        } else {
            this.completed(data); // Callback action: submitCompleted
        }
    }.bind(this));
});

module.exports = SystemInfoActions;
