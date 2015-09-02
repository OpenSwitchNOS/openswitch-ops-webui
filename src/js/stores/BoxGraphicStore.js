/*
 * The store for the box graphic.
 * @author Kelsey Dedoshka
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

    loadHwPorts: function(data) {

        for (var i=0; i<data.length; i++) {
            var port = data[i];
            this.state.hwData[port.data.name] =
                { 'portType': port.data.hw_intf_info.connector };
        }

        this.state.loadCompleted = 1;
        this.trigger(this.state);
    }
});
