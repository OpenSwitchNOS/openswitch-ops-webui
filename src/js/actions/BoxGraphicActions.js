/*
 * Actions for BoxGraphic Data.
 * @author Kelsey Dedoshka
 */

var Reflux = require('reflux'),
    RestUtils = require('restUtils'),
    RenderActions = require('RenderActions');

var BoxGraphicActions = Reflux.createActions({
    loadBoxGraphic: { asyncResult: true },
    loadHwPorts: { asyncResult: true }
});


BoxGraphicActions.loadHwPorts.listen(function() {
    RestUtils.get('/rest/v1/system/interfaces', function(e1, r1) {
        if (e1) {
            this.failed(e1);
        } else {
            RestUtils.get(r1.body, function(e2, r2) {
                if (err2) {
                    this.failed(e2);
                } else {
                    this.completed(r2);
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
