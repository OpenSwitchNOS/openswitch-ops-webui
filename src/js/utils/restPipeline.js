/*
 * Pipeline for batching up REST requests to the server.
 */

var Request = require('superagent'),
    Async = require('async'),
    I18n = require('i18n'),
    ObjectPath = require('object-path');


function dataNotUrlsErr(key, result) {
    console.log('REST pipeline bad result (not array of URLs):');
    console.log(result);
    return {
        error: {
            status: 500,
            responseText: I18n.text('err.dataNotUrls')
        }
    };
}

function verifyUrlArray(urls) {
    for (var i=0; i<urls.length; i++) {
        if (typeof urls[i] !== 'string') {
            return false;
        }
    }
    return true;
}

// Process the 'filter' spec entry filter (if any) for the resulting responses.
function filter(specEntry, resp) {
    var fp = specEntry.filter && specEntry.filter.split('.'),
        result = resp.body,
        i,
        subResult;

    if (fp) {
        for (i=0; i<fp.length; i++) {
            subResult = result[fp[i]];
            if (!subResult) {
                console.log('REST pipeline bad filter: "' +
                    specEntry.filter + '" index:' + i + ' item: "' + fp[i] +
                    '" applied on:');
                console.log(result);
                return result;
            }
            result = subResult;
        }
    }

    return result;
}

// Recursive function that performs requests on a list of URLs
// spec - the callers request specification
// specIdx - the current index of the recursion (0..n)
// prevResult - the previous recursion result, this can be: an array of
//      URLs, a single URL or and object of data to be returned
// pipelineCallback - the caller's original callback in the form fn(err, res)
function doRequests(spec, specIdx, prevResult, pipelineCallback) {
    var urls, urlOrResult,
        specEntry = spec[specIdx];

    if (!specEntry) {
        // We have reached the end of the spec entries.
        pipelineCallback(null, prevResult);

    } else if (specEntry.url ||
            (prevResult && typeof prevResult === 'string')) {
        // handle the 'url' spec entry option
        // handle a single url (non-parallel) URL.
        urlOrResult = specEntry.url || prevResult;
        if (specEntry.append) {
            urlOrResult = urlOrResult + '/' + specEntry.append;
        }
        Request.get(urlOrResult).end(function(err, resp) {
            if (err) {
                pipelineCallback(err, null);
            } else {
                doRequests(spec, specIdx + 1, filter(specEntry, resp),
                    pipelineCallback);
            }
        });

    } else if (!Array.isArray(prevResult) || !verifyUrlArray(prevResult)) {
        pipelineCallback(dataNotUrlsErr(prevResult), null);

    } else {
        // We now assume the previous result is a valid array of URLs.
        urls = prevResult;
        // handle the 'append' spec entry option
        if (specEntry.append) {
            urls = urls.map(function(item) {
                return item + '/' + specEntry.append;
            });
        }

        // Here we go, make requests to all the URLs in parallel. If we success,
        // recur back on the function to handle the next spec entry. If we hit
        // an error we are done.
        Async.map(urls,
            function(url, callback) {
                Request.get(url).end(callback);
            },
            function(err, resps) {
                if (err) {
                    pipelineCallback(err, null);
                } else {
                    // resps will be an array of all the responeses for the URLs
                    doRequests(spec, specIdx + 1,
                        resps.map(function(resp) {
                            return filter(specEntry, resp);
                        }),
                        pipelineCallback);
                }
            }
        );
    }
}

function getBody(url, callback) {
    Request.get(url).end(function(err, res) {
        callback(err, err ? null : (res && res.body));
    });
}

module.exports = {

    get: function(urls, pipelineCallback) {
        if (Array.isArray(urls)) {
            Async.map(urls, getBody, pipelineCallback);
        } else {
            getBody(urls, pipelineCallback);
        }
    },

    request: function(spec, pipelineCallback) {
        doRequests(spec, 0, {}, pipelineCallback);
    }

};
