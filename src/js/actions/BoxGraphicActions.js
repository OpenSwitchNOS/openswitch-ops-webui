/*
 * Actions for BoxGraphic Data.
 * @author Kelsey Dedoshka
 */

var Reflux = require('reflux'),
    RestUtils = require('restUtils'),
    RenderActions = require('RenderActions');

var BoxGraphicActions = Reflux.createActions({
    // Create the actions:
    //  loadVlans, loadVlansFailed, loadVlansCompleted
    loadBoxGraphic: { asyncResult: true },
    loadHwPorts: { asyncResult: true }
});


BoxGraphicActions.loadHwPorts.listen(function() {
    RestUtils.get('/system/Interface', function(err, res) {
        if (err) {
            this.failed(err);
        } else {
            //on success - request returned list of URLs
            RestUtils.get(res.data, function(err2, res2) {
                if (err2) {
                    this.failed(err2);
                } else {
                    this.completed(res2);
                }
            }.bind(this));
        }
    }.bind(this));
});

//on failure of the ports request
BoxGraphicActions.loadHwPorts.failed.listen(function(e) {
    RenderActions.postRequestErr(e);
});

// Self-handle the 'loadBoxGraphic' action by requesting server data.
BoxGraphicActions.loadBoxGraphic.listen(function() {

    var data = {
        base: [{
            style: 'alternate',
            middle: {
                numIndexes: 24
            },
            top: [
                {
                    'type': 'group',
                    'start': 1,
                    'end': 47
                }
            ],
            bottom: [
                {
                    'type': 'group',
                    'start': 2,
                    'end': 48
                }
            ],
            extra: {
                indexes: 25,
                ports: null
            }
        },
        {
            style: 'alternate',
            middle: {
                indexes: [49, 52]
            },
            top: [
                {
                    'type': 'single',
                    'num': [49, 52]
                }
            ],
            bottom: [
                {
                    'type': 'single',
                    'num': [50, 53]
                }
            ],
            extra: {
                indexes: 2,
                ports: [51, 54]
            }
        }],
    };

    this.completed(data);

});


module.exports = BoxGraphicActions;
