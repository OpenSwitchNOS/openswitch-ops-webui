/*
 * Mock SystemInfo resources.
 * @author Frank Wood
 */

module.exports = function(app) {

    var setHdr = function(res) {
            res.setHeader('Content-Type', 'application/json');
        },
        data = {
            product_name: 'HALON',
            base_mac_address: '70:72:cf:f5:fa:d6',
            version: '1.0.0.0',
            manufacture_date: '09/01/2015 00:00:01',
            manufacturer: 'HP Enterprise',
            onie_version: '2014.08.00.05',
            part_number: 'HPX8664',
            platform_name: 'Generic-x86-64',
            serial_number: 'X8664001',
            vendor: 'HP Enterprise',
            up_time: 0
        };

    function runner() {
        data.up_time = Math.floor(new Date().getTime() / 1000);
        setTimeout(function() { runner(); }, 1000);
    }
    runner();

    app.get('/ui/sysinfo', function (req, res) {
        setHdr(res);
        res.send(JSON.stringify(data));
    });
}
