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
    /*Request.get('/ui/boxGraphic').end(function(err, res) {
        if (err) {
            this.failed(err); // Action: loadVlansFailed
        } else {
            this.completed(res.body); // Action: loadVlansCompleted
        }
    }.bind(this));*/
    var data = {
        style: "alternate",
        middlePorts: 25,
        top: [
            {
                'type': 'group',
                'start': 1,
                'end': 47
            },
            {
                'type': 'single',
                'num': 49
            },
            {
                'type': 'single',
                'num': 52
            }],
        bottom: [
            {
                'type': 'group',
                'start': 2,
                'end': 48
            },
            {
                'type': 'single',
                'num': 50
            },
            {
                'type': 'single',
                'num': 53
            }
        ]
    };

    this.completed(data);

});

module.exports = BoxGraphicActions;
