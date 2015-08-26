/*
 * Actions for System information (rarely changes).
 * @author Frank Wood
 * @author Al Harrington
 */

var Reflux = require('reflux'),
    RestUtils = require('restUtils'),
    RenderActions = require('RenderActions');

var SystemInfoActions = Reflux.createActions({
    load: { asyncResult: true },
});

SystemInfoActions.load.listen(function() {

    RestUtils.get(['/system/subsystems/base', '/system'], function(err, res) {
        var otherInfo;
        if (err) {
            this.failed(err);
        } else {
            otherInfo = res[0].data.other_info;
            this.completed({
                onieVersion: otherInfo.onie_version,
                baseMac: otherInfo.base_mac_address.toUpperCase(),
                serialNum: otherInfo.serial_number,
                vendor: otherInfo.vendor,
                productName: otherInfo['Product Name'],
                version: otherInfo.diag_version,
                partNum: otherInfo.part_number,
                hostName: res[1].data.hostname
            });
        }
    }.bind(this));

});

SystemInfoActions.load.failed.listen(function(err) {
    RenderActions.postRequestErr(err);
});

module.exports = SystemInfoActions;
