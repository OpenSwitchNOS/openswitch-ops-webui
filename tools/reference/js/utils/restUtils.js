/*
 (C) Copyright 2015 Hewlett Packard Enterprise Development LP

    Licensed under the Apache License, Version 2.0 (the "License"); you may
    not use this file except in compliance with the License. You may obtain
    a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
    License for the specific language governing permissions and limitations
    under the License.
*/

/*
 * REST utilities.
 */

//FIXME - Kelsey reminder remove CORS from python server when making rest
//requests

var Request = require('superagent'),
    Async = require('async');

var URL_PREFIX = 'http://',
    PORT_POSTFIX = ':8091',
    REST_HOST = URL_PREFIX + window.location.hostname + PORT_POSTFIX,
    redirect;

function mkUrl(url) {
    // If we are running the unit tests don't modify the URL at all!
    if (!window.jasmine) {
        if (redirect) {
            return URL_PREFIX + redirect + PORT_POSTFIX + url;
        }
        return REST_HOST + url;
    }
    return url;
}

// Wraps the superagent GET request in a form that can be used as an Async
// callback (i.e. callback(err, res)).
function requestGet(url, callback) {
    var reqUrl = mkUrl(url);

    Request.get(reqUrl).withCredentials().end(function(err, res) {
        if (err) {
            err.reqUrl = reqUrl;
            callback(err, null);
        } else {
            callback(null, res);
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
            Async.map(req, requestGet, cb);
        }
    } else {
        requestGet(req, cb);
    }
}

function encodeValues(obj) {
    var encodedObj = {}, val;
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            val = obj[key];
            if (typeof val === 'object') {
                encodedObj[key] = encodeValues(val);
            } else {
                encodedObj[key] = encodeURIComponent(obj[key]);
            }
        }
    }
    return encodedObj;
}

// Wraps the superagent POST request (contentType is optional).
function post(url, body, callback, contentType) {
    var reqUrl = mkUrl(url);

    if (contentType === 'application/x-www-form-urlencoded') {
        Request.post(reqUrl)
            .type('form')
            .withCredentials()
            .send(encodeValues(body))
            .end(callback);
    } else {
        Request.post(reqUrl)
            .withCredentials()
            .send(body) // default is JSON
            .end(callback);
    }
}

// Wraps the superagent PUT request (contentType is optional).
function put(url, body, callback, contentType) {
    var reqUrl = mkUrl(url);

    if (contentType === 'application/x-www-form-urlencoded') {
        Request.put(reqUrl)
            .type('form')
            .withCredentials()
            .send(encodeValues(body))
            .end(callback);
    } else {
        Request.put(reqUrl)
            .withCredentials()
            .send(body) // default is JSON
            .end(callback);
    }
}

module.exports = {

    get: get,

    post: post,

    put: put,

    setRestApiRedirect: function(host) {
        redirect = host;
        console.log('REST API Redirect: ' + redirect);
    }

};
