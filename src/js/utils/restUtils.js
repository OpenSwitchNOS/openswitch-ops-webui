/*
 * REST utilities.
 */

var Request = require('superagent'),
    Async = require('async');

var init = false,
    REST_IP_DEV_MODE = 'http://15.108.28.69:8091',
    REST_IP = 'http://' + window.location.hostname + ':8091';

// Wraps the superagent GET request in a form that can be used as an Async
// callback (i.e. callback(err, res)).
function getBody(url, callback) {
    var reqUrl = url;

    if (window.webpackHotUpdate) {

        if (!init) {
            console.log('RestUtils DEV MODE: "' + REST_IP_DEV_MODE + '"');
            init = true;
        }
        reqUrl = REST_IP_DEV_MODE + url;

    } else if (!window.jasmine) {

        if (!init) {
            console.log('RestUtils PRODUCTION: "' + REST_IP + '"');
            init = true;
        }

        reqUrl = REST_IP + url;
    }

    Request.get(reqUrl).end(function(err, res) {
        if (err) {
            err.reqUrl = reqUrl;
            callback(err, null);
        } else {
            callback(null, res.body);
        }
    });
}

// Performs a GET request based on the passed in request parameter which can
// be a string, an array of strings, or an array of an array of strings.  All
// arrays (at each level) are performed in parallel.  For example:
//
// get('/system/bridges', cb)
//      -would simply invoke 'getBody'
//
// get(['/system/bridges/BRIDGE-0/vlans','/system/bridges/BRIDGE-0/ports'], cb)
//      -would call 'getBody" on both URLs in parallel
//
// get( [
//          '/system/bridges/BRIDGE-0/vlans/VLAN-0',
//          '/system/bridges/BRIDGE-0/vlans/VLAN-1',
//          '/system/bridges/BRIDGE-0/vlans/VLAN-2'
//      ], [
//          '/system/bridges/BRIDGE-0/ports/PORT-0',
//          '/system/bridges/BRIDGE-0/ports/PORT-1'
//      ]
// ])
//      -would call 'get' on both URL arrays in parallel, in turn, this would
//      -call 'getBody' on the first array and 'getBody' on the second array.
//
// Specifying silent as true, will hide any default error handling
//
function get(req, cb) {
    if (Array.isArray(req)) {
        if (req[0] && Array.isArray(req[0])) {
            Async.map(req, get, cb);
        } else {
            Async.map(req, getBody, cb);
        }
    } else {
        getBody(req, cb);
    }
}

module.exports = { get: get };
