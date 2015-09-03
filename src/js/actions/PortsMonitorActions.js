/*
 * Actions for Port Monitor View.
 * @author Kelsey Dedoshka
 */

var Reflux = require('reflux'),
    RestUtils = require('restUtils'),
    RenderActions = require('RenderActions');

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
        RestUtils.get('/rest/v1/system/interfaces/' + port, function(err, res) {
            if (err) {
                console.log(err);
            } else {
                this.completed(res);
            }
        }.bind(this));
    }
});

//handles failure for loading ports stats
PortsMonitorActions.loadPortStats.failed.listen(function(e) {
    RenderActions.postRequestErr(e);
});

//handles the 'loadPorts' actions by requesting data from the server
PortsMonitorActions.loadPorts.listen(function() {
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

//handles failure for loading ports
PortsMonitorActions.loadPorts.failed.listen(function(e) {
    RenderActions.postRequestErr(e);
});

module.exports = PortsMonitorActions;
