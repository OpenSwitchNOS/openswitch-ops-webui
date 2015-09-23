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
 * Data Store for the ports mgmt view
 */

//FIXME - do not truncate and do toFixed in any store - always in the view

var Reflux = require('reflux'),
    PortsActions = require('PortsActions');

//HELPER FUNCTIONS

// return true if the string contains a dash (-)
// used when sorting ports with port names
// containing a dash
function containsDash(elem) {
    if (elem.indexOf('-') >= 0) {
        return true;
    }

    return false;
}

// split port names with a dash and return
// item by specified index
function splitPort(elem, index) {
    return elem.split('-')[index];
}

module.exports = Reflux.createStore({

    init: function() {
        // FIXME: can't do this before login - PortsActions.loadPorts();
        this.listenTo(PortsActions.loadPorts.completed, 'setPorts');
    },

    // Data model port graph data, colors, and graph config
    state: {
        //list of ports on the device to display for selection
        allPorts: [],
        portStatus: {},
        loadCompleted: 0
    },

    // initialize the store.
    getInitialState: function() {
        return this.state;
    },

    // parse the response data for the keys
    // needed for the view
    parseResponse: function(port) {
        var pcfg = port.configuration;
        var psts = port.status;
        var portData = {};

        portData.name = pcfg.name;
        portData.adminState = psts.admin_state;
        portData.linkState = psts.link_state;
        portData.duplex = psts.duplex;
        portData.linkSpeed = psts.link_speed;
        portData.connector = psts.pm_info.connector;
        portData.vendorName = psts.pm_info.vendor_name;

        return portData;
    },

    //Callback for success of loading port list from server
    setPorts: function(ports) {
        var portStatus = this.state.portStatus;
        //var portData = parseResPorMgmt();
        var portData = [];

        for (var i=0; i<ports.length; i++) {
            //add port to portStatus object
            var pcfg = ports[i].configuration,
                psts = ports[i].status;

            portStatus[pcfg.name] = {};
            portStatus[pcfg.name].adminState = psts.admin_state;
            portStatus[pcfg.name].linkState = psts.link_state;

            // create port data obejct from the response with
            // the data keys needed for the view
            portData[i] = {};
            portData[i] = this.parseResponse(ports[i]);
        }

        // sort the ports by number
        this.state.allPorts = portData.sort(function(a, b) {
            var numA = a.name;
            var numB = b.name;

            // case 1: neither port has a dash - sort normally
            // case 2: if one port has a dash and one does not
            // sort the port without a dash first
            // case 3: both ports have a dash - sort by comparing
            // the main and sub numbers

            if (!(containsDash(numA)) && !(containsDash(numB))) {
                return (numA - numB);
            } else if (!(containsDash(numA)) && containsDash(numB)) {
                return -1;
            } else if (containsDash(numA) && !(containsDash(numB))) {
                return 1;
            }

            var aMain = splitPort(numA, 0);
            var aSub = splitPort(numA, 1);
            var bMain = splitPort(numB, 0);
            var bSub = splitPort(numB, 1);

            if (aMain === bMain) {
                return (aSub - bSub);
            }

            return (aMain - bMain);

        });

        this.trigger(this.state);
    }
});
