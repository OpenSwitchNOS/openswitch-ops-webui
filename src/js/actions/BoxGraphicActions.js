/*
 * Actions for BoxGraphic Data.
 * @author Kelsey Dedoshka
 */

var Reflux = require('reflux'),
    Request = require('superagent');

var BoxGraphicActions = Reflux.createActions({
    // Create the actions:
    //  loadVlans, loadVlansFailed, loadVlansCompleted
    loadBoxGraphic: { asyncResult: true }
});

// Self-handle the 'loadVlans' action by requesting server data.
BoxGraphicActions.loadBoxGraphic.listen(function() {
    Request.get('/ui/boxGraphic').end(function(err, res) {
        if (err) {
            this.failed(err); // Action: loadVlansFailed
        } else {
            this.completed(res.body); // Action: loadVlansCompleted
        }
    }.bind(this));
});

module.exports = BoxGraphicActions;
