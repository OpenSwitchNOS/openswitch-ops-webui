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
        startTop: 1,
        endTop: 52,
        startBottom: 2,
        endBottom: 53
    };

    app.get('/ui/boxGraphic', function (req, res) {
        setHdr(res);
        res.send(JSON.stringify(data));
    });
}
