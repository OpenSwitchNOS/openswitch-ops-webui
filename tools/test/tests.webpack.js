/*
 * Used by karma to find and run the test files.
 * @author Frank Wood
 */

// ES5 shims for Function.prototype.bind, Object.prototype.keys, etc.
require('core-js/es5');

// Create a set of webpack module ids for our project's modules, excluding
// tests. This will be used to clear the module cache before each test.
var projectContext = require.context('../../src/js', true,
    /^((?!__tests__).)*.(jsx|js)?$/);

var projectModuleIds = projectContext.keys().map(function(module) {
    return String(projectContext.resolve(module));
});

// Helpers to make a responses from the passed in data.
AjaxResponse = function(data, status) {
    return {
        status: status || 200,
        responseText: JSON.stringify(data)
    };
};

// Register an ajax request returing success data (uses 'mock-ajax.js').
AjaxStubRequest = function(url, data, status) {
    jasmine.Ajax.stubRequest(url).andReturn(AjaxResponse(data, status));
};

// Respond to the most recent ajax request (uses 'mock-ajax.js').
AjaxRespondWith = function(data) {
    jasmine.Ajax.requests.mostRecent().respondWith(AjaxResponse(data));
};

beforeEach(function() {
    // Clear the module cache before each test. Many of our modules, such as
    // Stores and Actions, are singletons that have state that we don't want to
    // carry over between tests. Clearing the cache makes 'require(module)'
    // return a new instance of the singletons. Modules are still cached within
    // each test case.
    var cache = require.cache;
    projectModuleIds.forEach(function(id) {
        delete cache[id];
    });

    jasmine.clock().install();  // to trigger actions
    jasmine.Ajax.install();     // to mock ajax (XMLHttpRequest)
});

afterEach(function() {
    jasmine.Ajax.uninstall();
    jasmine.clock().uninstall();
})

// Load each test using webpack's dynamic require with contexts
// (files "*-test.jsx|js" under './src/js').
var context = require.context('../../src/js', true, /-test\.(jsx|js)$/);
context.keys().forEach(context);
