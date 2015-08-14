/*
 * Mock system stats resources.
 * @author Frank Wood
 */

module.exports = function(app) {

    var setHdr = function(res) {
            res.setHeader('Content-Type', 'application/json');
        },
        data = {
            fan_status: 'ok',
            power_status: 'ok',

            up_time: 0,

            cpu: 0.3,
            cpu_max: 1.0,

            stor: 10,
            stor_max: 100,

            mem: 15,
            mem_max: 16,

            temp: 33,
            temp_max: 70,
        };

    function runner() {
        data.up_time = Math.floor(new Date().getTime() / 1000);
        data.cpu = Math.floor((Math.random() * 9) + 1) / 10;
        data.stor = Math.floor((Math.random() * 100) + 1);
        data.mem = Math.floor((Math.random() * 16) + 1);
        data.temp = Math.floor((Math.random() * 70) + 1);
        setTimeout(function() { runner(); }, 1000);
    }
    runner();

    app.get('/ui/sysstats', function (req, res) {
        setHdr(res);
        res.send(JSON.stringify(data));
    });
}
