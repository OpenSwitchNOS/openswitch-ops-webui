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

var configFile = process.env.OPS_WEBUI_BUILD_CONFIG || 'build.config.js';

var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: [
    './index.jsx'
  ],
  output: {
    path: './build',
    filename: 'bundle.js'
  },
  resolve: {
    root: [
      __dirname + '/src/modules',
      __dirname + '/src/shared',
      __dirname + '/src/shared/assets',
      __dirname + '/src/shared/components',
    ],
    alias: {
      buildConfig: __dirname + '/' + configFile
    }
  },
  devServer: {
    contentBase: './build'
  },
  devtool: 'source-map',
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
        loader: 'style!css!sass' +
          '?includePaths[]=' + __dirname + '/node_modules'
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
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: 'index.html' },
      { from: 'src/shared/assets/favicon.ico' }
    ])
  ]
}
