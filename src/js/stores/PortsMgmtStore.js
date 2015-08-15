/*
 * Data Store for the ports mgmt view
 * @author Kelsey Dedoshka
 */

var Reflux = require('reflux'),
    PortsMgmtActions = require('PortsMgmtActions');

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
    onLoadPortsCompleted: function(ports) {
        this.state.allPorts = ports.sort(function(a, b) {
            return Number(a.data.name)-Number(b.data.name);
        });

        for (var key in ports) {
            if (ports.hasOwnProperty(key)) {
                var port = ports[key];
                //FIXME - should this be link state or admin state
                this.state.portStatus[port.data.name] =
                    port.data.link_state;
            }
        }

        this.trigger(this.state);
    }
});
