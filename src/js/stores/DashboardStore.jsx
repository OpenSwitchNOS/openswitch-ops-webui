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
 * The store for the dashboard view.
 */

var Reflux = require('reflux'),
    SystemInfoActions = require('SystemInfoActions'),
    SystemStatsActions = require('SystemStatsActions'),
    InterfaceStatsStore = require('InterfaceStatsStore');

module.exports = Reflux.createStore({

    init: function() {
        this.listenTo(SystemInfoActions.load.completed, 'onInfo');
        this.listenTo(SystemStatsActions.load.completed, 'onStats');
        this.listenTo(InterfaceStatsStore, 'onInterfaceStats');
    },

    state: {
        sysInfo: {},
        sysStats: {
            fans: [],
            powerSupplies: []
        },
        interfaceStats: {}
    },

    getInitialState: function() {
        return this.state;
    },

    onInfo: function(info) {
        this.state.sysInfo = info;
        this.trigger(this.state);
    },

    onStats: function(stats) {
        this.state.sysStats = stats;
        this.trigger(this.state);
    },

    onInterfaceStats: function(interfaceStats) {
        this.state.interfaceStats = interfaceStats;
        this.trigger(this.state);
    }

});
