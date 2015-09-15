/*
 * Actions for Port Store.
 * @author Kelsey Dedoshka
 */

var Reflux = require('reflux'),
    RestUtils = require('restUtils'),
    RenderActions = require('RenderActions');

var PortsActions = Reflux.createActions({
    loadPorts: { asyncResult: true },
});

PortsActions.loadPorts.listen(function() {
    RestUtils.get('/rest/v1/system/interfaces', function(e1, r1) {
        if (e1) {
            this.failed(e1);
        } else {
            RestUtils.get(r1.body, function(e2, r2) {
                var port, ports = [];
                if (e2) {
                    this.failed(e2);
                } else {
                    for (var i=0; i<r2.length; i++) {
                        port = r2[i].body;
                        // system as type means it is a port
                        if (port.configuration.type === 'system') {
                            ports.push(port);
                        }
                    }
                    this.completed(ports);
                }
            }.bind(this));
        }
    }.bind(this));
});

PortsActions.loadPorts.failed.listen(function(e) {
    RenderActions.postRequestErr(e);
});

module.exports = PortsActions;
