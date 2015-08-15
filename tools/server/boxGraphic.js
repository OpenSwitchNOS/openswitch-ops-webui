/**
 * Mock VLAN resources.
 * @author Kelsey Dedoshka
 */

module.exports = function(app) {

    var setHdr = function(res) {
        res.setHeader('Content-Type', 'application/json');
    };

    var data = {
        style: "alternate",
        middlePorts: 25,
        top: [
            {
                'type': 'group',
                'start': 1,
                'end': 47
            },
            {
                'type': 'single',
                'num': 49
            },
            {
                'type': 'single',
                'num': 52
            }],
        bottom: [
            {
                'type': 'group',
                'start': 2,
                'end': 48
            },
            {
                'type': 'single',
                'num': 50
            },
            {
                'type': 'single',
                'num': 53
            }
        ]
    };

    app.get('/ui/boxGraphic', function (req, res) {
        setHdr(res);
        res.send(JSON.stringify(data));
    });
}
