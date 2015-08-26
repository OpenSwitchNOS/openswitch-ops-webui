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
});

//Action to request the the list of ports
PortsMgmtActions.loadPorts.listen(function() {
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

//on failure of the portss request
PortsMgmtActions.loadPorts.failed.listen(function(e) {
    RenderActions.postRequestErr(e);
});

module.exports = PortsMgmtActions;
