/*
 * Karma configuration file that reuses the webpack configuration.
 * Please see:
 *  http://karma-runner.github.io/0.8/config/configuration-file.html
 *  https://www.codementor.io/reactjs/tutorial/test-reactjs-components-karma-webpack
 *  http://kentor.me/posts/testing-react-and-flux-applications-with-karma-and-webpack/
 * @author Frank Wood
 */

var Path = require('path');
var WebpackConfig = require('../../webpack.config');

WebpackConfig.devtool = 'inline-source-map';

module.exports = function(config) {
    // Karma configuration.
    config.set({
        // List of browsers to run the unit tests under.
        browsers: [ 'PhantomJS' ],

        // Use 'true' to turn off continuous testing.
        singleRun: false,

        // Override normal file patterns and load this file.
        files: [
            'tests.webpack.js',
            'mock-ajax.js'
        ],

        // Use the following test framework (others are 'mocha').
        frameworks: [ 'jasmine' ],

        // Preprocess our 'test suite' with webpack
        preprocessors: {
            'tests.webpack.js': 'webpack'
        },

        // Reuse the webpack configuration.
        webpack: WebpackConfig,

        // Please don't spam the console when running in karma.
        webpackServer: { noInfo: true },

        reporters: [ 'mocha' ]
    });
};
