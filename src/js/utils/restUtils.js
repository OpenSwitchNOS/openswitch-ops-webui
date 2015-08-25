/*
 * REST utilities.
 */

//FIXME - Kelsey reminder remove CORS from python server when making rest
//requests

var Request = require('superagent'),
    Async = require('async'),
    RenderStore = require('RenderStore'); // FIXME dependency in here is bad

var URL_PREFIX = 'http://',
    PORT_POSTFIX = ':8091',
    REST_HOST = URL_PREFIX + window.location.hostname + PORT_POSTFIX;

// Wraps the superagent GET request in a form that can be used as an Async
// callback (i.e. callback(err, res)).
function getBody(url, callback) {
    var reqUrl = url,
        redirect;

    // If we are running the unit tests don't modify the URL at all!
    if (!window.jasmine) {
        redirect = RenderStore.state && RenderStore.state.restApiRedirect;
        if (redirect) {
            reqUrl = URL_PREFIX + redirect + PORT_POSTFIX + url;
        } else {
            reqUrl = REST_HOST + url;
        }
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

function hasArrayElement(arr) {
    for (var i=0; i<arr.length; i++) {
        if (Array.isArray(arr[i])) {
            return true;
        }
    }
    return false;
}

function get(req, cb) {
    if (Array.isArray(req)) {
        if (hasArrayElement(req)) {
            Async.map(req, get, cb);
        } else {
            Async.map(req, getBody, cb);
        }
    } else {
        getBody(req, cb);
    }
}

module.exports = { get: get };
