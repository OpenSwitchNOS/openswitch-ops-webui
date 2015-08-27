/*
 * The store for the box graphic.
 * @author Kelsey Dedoshka
 */

var Reflux = require('reflux'),
    BoxGraphicActions = require('BoxGraphicActions');

module.exports = Reflux.createStore({

    // I want callbacks on these actions.
    listenables: [ BoxGraphicActions ],

    // Data model for box graphic state
    state: {
        ports: [],
        data: {
            base: []
        },
        hwData: {},
        loadCompleted: 0
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

    onLoadHwPortsCompleted: function(data) {

        // loop through all interfaces and determine
        // if they are a port or not
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                var port = data[key];

                // empty string as type means it is a port
                if (port.data.type === '') {
                    this.state.ports.push(port);

                    //generate hw port data
                    this.state.hwData[port.data.name] =
                        { 'portType': port.data.hw_intf_info.connector };
                }
            }
        }

        this.state.loadCompleted = 1;
        this.trigger(this.state);
    }
});
