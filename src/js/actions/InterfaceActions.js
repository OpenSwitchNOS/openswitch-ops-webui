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

function processResponse(res) {
    return res.map(function(r) {
        var sts = r.body.status,
            stats = r.body.statistics.statistics;
        return {
            link: sts.link_state[0],
            duplex: sts.duplex[0],
            speed: Number(sts.link_speed[0]),
            name: r.body.configuration.name,
            rxBytes: Number(stats.rx_bytes),
            txBytes: Number(stats.tx_bytes)
        };
    });
}

InterfaceActions.load.listen(function() {

    RestUtils.get('/rest/v1/system/interfaces', function(e1, r1) {
        if (e1) {
            this.failed(e1);
        } else {
            RestUtils.get(r1.body, function(e2, r2) {
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
