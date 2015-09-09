/*
 * Actions for Port Mgmt View.
 * @author Kelsey Dedoshka
 */

var Reflux = require('reflux'),
    RestUtils = require('restUtils'),
    RenderActions = require('RenderActions');

var PortsMgmtActions = Reflux.createActions({

    // Create the view's actions:
    loadPorts: { asyncResult: true },
    setPorts: {}
});

//Action to request the the list of ports
PortsMgmtActions.loadPorts.listen(function() {
    RestUtils.get('/rest/v1/system/interfaces', function(e1, r1) {
        if (e1) {
            this.failed(e1);
        } else {

            //on success - request returned list of URLs
            RestUtils.get(r1.body, function(e2, r2) {
                if (e2) {
                    this.failed(e2);
                } else {
                    this.completed(r2);
                }
            }.bind(this));
        }
    }.bind(this));
});

//on failure of the portss request
PortsMgmtActions.loadPorts.failed.listen(function(e) {
    RenderActions.postRequestErr(e);
});

module.exports = PortsMgmtActions;
