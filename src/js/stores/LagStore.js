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
 * LAG store.
 */

var Reflux = require('reflux'),
    LagActions = require('LagActions');

module.exports = Reflux.createStore({

    listenables: [ LagActions ],

    state: {
        config: {},
        lags: [],
        loadedLag: null,
        infs: [],
    },

    getInitialState: function() {
        return this.state;
    },

    onLoadLagsCompleted: function(data) {
        this.state.lags = data.lags.sort(function(l1, l2) {
            return (l1.name > l2.name) ? 1 : ((l2.name > l1.name) ? -1 : 0);
        });
        this.state.config = data.config;
        this.trigger(this.state);
    },

    onLoadInterfacesCompleted: function(lag, infs) {
        this.state.loadedLag = lag;
        this.state.infs = infs.sort(function(i1, i2) {
            return (i1.name > i2.name) ? 1 : ((i2.name > i1.name) ? -1 : 0);
        });
        this.trigger(this.state);
    }

});
