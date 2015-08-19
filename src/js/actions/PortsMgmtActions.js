/*
 * Actions for Port Mgmt View.
 * @author Kelsey Dedoshka
 */

var Reflux = require('reflux'),
    RestUtils = require('restUtils');

var PortsMgmtActions = Reflux.createActions({

    // Create the view's actions:
    loadPorts: { asyncResult: true },
});

//var ip = 'http://15.108.28.69:8091';

//handles the 'loadPorts' actions by requesting data from the server
PortsMgmtActions.loadPorts.listen(function() {
    RestUtils.get('/system/bridges/bridge_normal/ports', function(err, res) {
        if (err) {
            console.log(err);
        } else {
            //FIXME - only needed while using ip var - remove when
            //remove ip var
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

module.exports = PortsMgmtActions;
