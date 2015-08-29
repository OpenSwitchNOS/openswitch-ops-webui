/*
 * Actions for Port Store.
 * @author Kelsey Dedoshka
 */

var Reflux = require('reflux'),
    RestUtils = require('restUtils'),
    RenderActions = require('RenderActions');

var PortsActions = Reflux.createActions({

    // Create the view's actions:
    loadPorts: { asyncResult: true },
});

//Action to request the the list of ports
PortsActions.loadPorts.listen(function() {
    RestUtils.get('/system/Interface', function(err, res) {
        if (err) {
            this.failed(err);
        } else {

            //on success - request returned list of URLs
            RestUtils.get(res.data, function(err2, res2) {
                if (err2) {
                    this.failed(err2);
                } else {
                    var ports = [];
                    for (var i=0; i<res2.length; i++) {
                        var port = res2[i];

                        // empty string as type means it is a port
                        if (port.data.type === '') {
                            ports.push(port);
                        }
                    }

                    this.completed(ports);
                }
            }.bind(this));
        }
    }.bind(this));
});

//on failure of the portss request
PortsActions.loadPorts.failed.listen(function(e) {
    RenderActions.postRequestErr(e);
});

module.exports = PortsActions;
