/*
 * Data Store for the ports mgmt view
 * @author Kelsey Dedoshka
 */

//FIXME - do not truncate and do toFixed in any store - always in the view

var Reflux = require('reflux'),
    PortsActions = require('PortsActions'),
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

    init: function() {
        PortsActions.loadPorts();
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

    //Callback for success of loading port list from server
    setPorts: function(ports) {
        var portStatus = this.state.portStatus;

        for (var i=0; i<ports.length; i++) {
            //add port to portStatus object
            var pcfg = ports[i].configuration,
                psts = ports[i].status;

            portStatus[pcfg.name] = {};
            portStatus[pcfg.name].adminState = psts.admin_state[0];
            portStatus[pcfg.name].linkState = psts.link_state[0];
        }

        // sort the ports by number
        this.state.allPorts = ports.sort(function(a, b) {
            var numA = a.configuration.name;
            var numB = b.configuration.name;

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
