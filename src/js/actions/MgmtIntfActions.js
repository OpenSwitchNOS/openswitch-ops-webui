/*
 * Actions for Management Interface.
 * @author Al Harrington
 */

var Reflux = require('reflux'),
    RestUtils = require('restUtils'),
    RenderActions = require('RenderActions');

var MgmtIntfActions = Reflux.createActions({
    load: { asyncResult: true },
});

MgmtIntfActions.load.listen(function() {

    RestUtils.get('/rest/v1/system', function(err, res) {
        var result = {};
        if (err) {
            this.failed(err);
        } else {
            var mgmtIntf = res.body.configuration.mgmt_intf;
            if ( mgmtIntf.name ) {
                result.name = mgmtIntf.name;
            }
            // chance that 'mode' could not exist, which is defaulted to 'dhcp'
            if ( mgmtIntf.mode ) {
                if ( mgmtIntf.mode === 'static' ) {
                    result.mode = 'static';
                    if ( mgmtIntf.ip ) {
                        result.ip = mgmtIntf.ip;
                    }
                    if ( mgmtIntf['subnet-mask'] ) {
                        result.subnetMask = mgmtIntf['subnet-mask'];
                    }
                    if ( mgmtIntf['default-gateway'] ) {
                        result.defaultGateway = mgmtIntf['default-gateway'];
                    }
                    if ( mgmtIntf.ipv6 ) {
                        result.ipv6 = mgmtIntf.ipv6;
                    }
                    if ( mgmtIntf['dns-server1'] ) {
                        result.dnsServer1 = mgmtIntf['dns-server1'];
                    }
                    if ( mgmtIntf['dns-server2'] ) {
                        result.dnsServer2 = mgmtIntf['dns-server2'];
                    }
                } else {
                    result.mode = 'dhcp';
                }
            }
            this.completed(result);
        }
    }.bind(this));
});

MgmtIntfActions.load.failed.listen(function(err) {
    RenderActions.postRequestErr(err);
});

module.exports = MgmtIntfActions;
