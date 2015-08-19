/*
 * Actions for System information (rarely changes).
 * @author Frank Wood
 * @author Al Harrington
 */

var Reflux = require('reflux'),
    RestUtils = require('restUtils');

var SystemInfoActions = Reflux.createActions({
    // Actions: load, loadFailed, loadCompleted
    load: { asyncResult: true },
});

// FIXME: determine best place to get hostname
SystemInfoActions.load.listen(function() {

    RestUtils.get(['/system/subsystems/base', '/system'], function(err, res) {
        var otherInfo;
        if (err) {
            this.failed(err); // Callback action: loadFailed
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
            }); // Callback action: loadCompleted
        }
    }.bind(this));

});

module.exports = SystemInfoActions;
