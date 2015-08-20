/*
 * Actions for interfaces (frequently changes).
 * @author Frank Wood
 */

// TODO: make action file names consistent with stores (Port vs Ports).

var Reflux = require('reflux'),
    RestUtils = require('restUtils'),
    RenderActions = require('RenderActions');

var InterfaceActions = Reflux.createActions({
    load: { asyncResult: true },
});

function processResponse(interfaces) {
    return interfaces.map(function(item) {
        var data = item.data;
        return {
            link: data.link_state[0],
            duplex: data.duplex[0],
            speed: Number(data.link_speed[0]),
            name: data.name,
            rxBytes: Number(data.statistics.rx_bytes),
            txBytes: Number(data.statistics.tx_bytes)
        };
    });
}

InterfaceActions.load.listen(function() {

    RestUtils.get('/system/Interface', function(e1, r1) {
        if (e1) {
            this.failed(e1);
        } else {
            RestUtils.get(r1.data, function(e2, r2) {
                if (e2) {
                    this.failed(e2);
                } else {
                    this.completed(processResponse(r2));
                }
            }.bind(this));
        }
    }.bind(this));

});

InterfaceActions.load.failed.listen(function(e) {
    RenderActions.postRequestErr(e);
});


module.exports = InterfaceActions;
