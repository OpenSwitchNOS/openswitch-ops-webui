/*
 * Mock port resources.
 * @author Frank Wood
 */

module.exports = function(app) {

    var setHdr = function(res) {
        res.setHeader('Content-Type', 'application/json');
    }

    var ports = [
        {
            id: 1,
            stats: {
                utilization: 10
            }
        },
        {
            id: 2,
            stats: {
                utilization: 55
            }
        },
        {
            id: 3,
            stats: {
                utilization: 85
            }
        },
        {
            id: 4,
            stats: {
                utilization: 95
            }
        },
        {
            id: 5,
            stats: {
                utilization: 5
            }
        },
        {
            id: 6,
            stats: {
                utilization: 1
            }
        }
    ];

    app.get('/ui/ports', function (req, res) {
        setHdr(res);
        res.send(JSON.stringify(ports));
    });
}
