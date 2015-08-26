/*
 * Data Store for the ports mgmt view
 * @author Kelsey Dedoshka
 */

//FIXME - do not truncate and do toFixed in any store - always in the view

var Reflux = require('reflux'),
    PortsMgmtActions = require('PortsMgmtActions');

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

    listenables: [ PortsMgmtActions ],

    // Data model port graph data, colors, and graph config
    state: {
        //list of ports on the device to display for selection
        allPorts: [],
        portStatus: {}
    },

    // initialize the store.
    getInitialState: function() {
        return this.state;
    },

    //Callback for success of loading port list from server
    onLoadPortsCompleted: function(interfaces) {
        var ports = [];

        // loop through all interfaces and determine
        // if they are a port or not
        for (var key in interfaces) {
            if (interfaces.hasOwnProperty(key)) {
                var port = interfaces[key];

                // empty string as type means it is a port
                if (port.data.type === '') {
                    ports.push(port);

                    //add port to portStatus object
                    this.state.portStatus[port.data.name] = {};
                    this.state.portStatus[port.data.name].adminState =
                        port.data.admin_state[0];
                    this.state.portStatus[port.data.name].linkState =
                        port.data.link_state[0];
                }

            }
        }

        // sort the ports by number
        this.state.allPorts = ports.sort(function(a, b) {
            var numA = a.data.name;
            var numB = b.data.name;

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
