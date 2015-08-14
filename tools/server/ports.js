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
                utilization: 0
            }
        },
        {
            id: 2,
            stats: {
                utilization: 0
            }
        },
        {
            id: 3,
            stats: {
                utilization: 0
            }
        },
        {
            id: 4,
            stats: {
                utilization: 0
            }
        },
        {
            id: 5,
            stats: {
                utilization: 0
            }
        },
        {
            id: 6,
            stats: {
                utilization: 0
            }
        }
    ];

    function runner() {
        for (var i=0; i<ports.length; i++) {
            ports[i].stats.utilization = Math.floor((Math.random() * 100) + 1);
        }
        setTimeout(function() { runner(); }, 1000);
    }
    runner();

    app.get('/ui/ports', function (req, res) {
        setHdr(res);
        res.send(JSON.stringify(ports));
    });
}
