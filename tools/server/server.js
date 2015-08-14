/**
 * Mock server (point browser to: http://localhost:3000).
 * Uses the 'express' plug-in.
 * @author Frank Wood
 */

var path = require('path'),
    express = require('express'),
    app = express();

// This is where you can add mock resources.
require('./vlans')(app);
require('./sysInfo')(app);
require('./sysStats')(app);
require('./ports')(app);
require('./boxGraphic')(app);

// This will allow the browser to load static files under "./build"
app.use(express.static('build'));

// This is boilerplate server stuff.
var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Mock server listening at http://localhost:%s', port);
});
