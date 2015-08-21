/*
 * Actions for Port Monitor View.
 * @author Kelsey Dedoshka
 */

var Reflux = require('reflux'),
    RestUtils = require('restUtils');

var PortsMonitorActions = Reflux.createActions({

    // Create the view's actions:
    loadPortStats: { asyncResult: true },
    loadPorts: { asyncResult: true },
    setChartContext: {},
    setBarChartContext: {},
    toggleGraphDisplay: {},
    setActiveDetails: {},
    resetGraph: {},
    showStatus: {},
    setPortSelected: {},
    setInterval: {},
    setPausePlayHandler: {},
    setBarChart: {}
});

//handles the 'loadPortStats' action by requesting data from the server
PortsMonitorActions.loadPortStats.listen(function(port) {
    // make sure port is not null
    if (port) {
        RestUtils.get('/system/Interface/' + port, function(err, res) {
            if (err) {
                console.log(err);
            } else {
                this.completed(res);
            }
        }.bind(this));
    }
});

//handles the 'loadPorts' actions by requesting data from the server
PortsMonitorActions.loadPorts.listen(function() {
    RestUtils.get('/system/bridges/bridge_normal/ports', function(err, res) {
        if (err) {
            console.log(err);
        } else {
            var res = res.data;
            for (var i=0; i<res.length; i++) {
                var port = res[i].split('/')[3];
                res[i] = '/system/Interface/' + port;
            }

            RestUtils.get(res, function(err2, res2) {
                if (err2) {
                    console.log(err);
                } else {
                    this.completed(res2);
                }
            }.bind(this));
        }
    }.bind(this));
});

module.exports = PortsMonitorActions;
