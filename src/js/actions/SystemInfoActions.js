/*
 * Actions for System information (rarely changes).
 * @author Frank Wood
 */

var Reflux = require('reflux'),
    RestUtils = require('restUtils');

var SystemInfoActions = Reflux.createActions({
    // Actions: load, loadFailed, loadCompleted
    load: { asyncResult: true },
});

SystemInfoActions.load.listen(function() {

    RestUtils.get('/system/subsystems/base', function(err, resBody) {
        var otherInfo;
        if (err) {
            this.failed(err); // Callback action: loadFailed
        } else {
            otherInfo = resBody.data.other_info;
            this.completed({
                onieVersion: otherInfo.onie_version,
                baseMac: otherInfo.base_mac_address.toUpperCase(),
                serialNum: otherInfo.serial_number,
                vendor: otherInfo.vendor,
                productName: otherInfo['Product Name'],
                version: otherInfo.diag_version,
                partNum: otherInfo.part_number
            }); // Callback action: loadCompleted
        }
    }.bind(this));

});

module.exports = SystemInfoActions;
