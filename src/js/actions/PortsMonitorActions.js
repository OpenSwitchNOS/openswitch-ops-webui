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
    setInterval: {}
});

//FIXME - for testing - will be removed
var ip = 'http://16.93.60.148:8888';

//handles the 'loadPortStats' action by requesting data from the server
PortsMonitorActions.loadPortStats.listen(function(port) {

    RestUtils.get(ip + '/system/Interface/' + port, function(err, res) {
        if (err) {
            console.log(err);
        } else {
            this.completed(res);
        }
    }.bind(this));

});

//handles the 'loadPorts' actions by requesting data from the server
PortsMonitorActions.loadPorts.listen(function() {
    RestUtils.get(ip + '/system/bridges/bridge_normal/ports', function(err, res) {
        if (err) {
            console.log(err);
        } else {
            //FIXME - only needed while using ip var - remove when
            //remove ip var
            var res = JSON.parse(res).data;
            for (var i=0; i<res.length; i++) {
                res[i] = ip + res[i];
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
