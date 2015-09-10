/*
 * Actions for BoxGraphic Data.
 * @author Kelsey Dedoshka
 */

var Reflux = require('reflux');

var BoxGraphicActions = Reflux.createActions({
    loadBoxGraphic: { asyncResult: true }
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
