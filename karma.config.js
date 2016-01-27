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

var webpack = require('webpack');

module.exports = function(config) {

  var postLoaders = [];

  if (config.usePostLoaders) {
    postLoaders = [
      {
        test: /(.jsx|.js)$/,
        exclude: /(test|node_modules)\//,
        loader: 'istanbul-instrumenter'
      }
    ];
  }

  config.set({

    plugins: [
      require('karma-webpack'),
      require('karma-jasmine'),
      require('karma-sourcemap-loader'),
      require('karma-phantomjs-launcher'),
      require('karma-mocha-reporter'),
      require('karma-phantomjs-shim'),
      require('karma-coverage')
    ],

    frameworks: [ 'phantomjs-shim', 'jasmine' ],

    files: [ 'karma.config.tests.js' ],

    preprocessors: {
      'karma.config.tests.js': [ 'webpack', 'sourcemap' ]
    },

    webpack: {
      devtool: 'inline-source-map',
      resolve: {
        root: [
          __dirname + '/src/modules',
          __dirname + '/src/shared',
          __dirname + '/src/shared/assets',
          __dirname + '/src/shared/components',
        ]
      },
      module: {
        preLoaders: [
          {
            test: /\.(jsx|js)$/,
            loader: 'eslint',
            exclude: /node_modules/
          }
        ],
        loaders: [
          {
            test: /\.scss$/,
            loader: 'style!css!sass?includePaths[]='
                + __dirname + '/node_modules'
          },
          {
            test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            loader: 'file'
          },
          {
            test: /\.(jsx|js)$/,
            loader: 'babel',
            exclude: /node_modules/
          }
        ],
        postLoaders: postLoaders,
      }
    },

    webpackMiddleware: {
      noInfo: true
    },

    reporters: [ 'mocha', 'coverage' ],

    browsers: [ 'PhantomJS' ]

  });
};
