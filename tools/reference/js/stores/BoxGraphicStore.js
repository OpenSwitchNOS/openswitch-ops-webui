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
 * The store for the box graphic.
 */

var Reflux = require('reflux'),
    PortsActions = require('PortsActions'),
    BoxGraphicActions = require('BoxGraphicActions');

module.exports = Reflux.createStore({

    // I want callbacks on these actions.
    listenables: [ BoxGraphicActions, PortsActions ],

    init: function() {
        //PortsActions.loadPorts();
        this.listenTo(PortsActions.loadPorts.completed, 'loadHwPorts');
    },

    // Data model for box graphic state
    state: {
        ports: [],
        data: {
            base: []
        },
        hwData: {},
        loadCompleted: 0,
        showGraphic: 0
    },

    // Can be used to initialize users of this store.
    getInitialState: function() {
        return this.state;
    },

    // Callback for VlanActions.loadVlansCompleted
    onLoadBoxGraphicCompleted: function(data) {
        this.state.data = data;
        this.trigger(this.state);
    },

    loadHwPorts: function(ports) {
        var name, port;
        for (var i=0; i<ports.length; i++) {
            port = ports[i];
            name = port.configuration.name;
            this.state.hwData[name] =
                { 'portType': port.status.hw_intf_info.connector };
        }

        // set the show graphic param to true
        if (ports.length > 0) {
            this.state.showGraphic = 1;
        }

        this.state.loadCompleted = 1;
        this.trigger(this.state);
    }
});
