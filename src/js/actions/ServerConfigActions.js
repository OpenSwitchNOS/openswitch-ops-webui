/*
 * Actions for server configuration.
 * @author Frank Wood
 */

var Reflux = require('reflux'),
    // RestUtils = require('restUtils'),
    RenderActions = require('RenderActions');

var ServerConfigActions = Reflux.createActions({
    init: { asyncResult: true },
    reset: { }
});

// function processResponse(r) {
//     console.log('Process init response: ' + r);
// }

ServerConfigActions.init.listen(function() {
    console.log('Not implemented - init server');
    this.completed();

    // RestUtils.get('/login', function(e, r) {
    //     if (e) {
    //         this.failed(e);
    //     } else {
    //         this.completed(processResponse(r));
    //     }
    // }.bind(this));
});

ServerConfigActions.init.failed.listen(function(e, r) {
    RenderActions.postRequestErr(e, r);
});

module.exports = ServerConfigActions;
