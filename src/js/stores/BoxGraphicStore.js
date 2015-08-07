/*
 * The store for VLANs.
 * @author Frank Wood
 */

var Reflux = require('reflux'),
    BoxGraphicActions = require('BoxGraphicActions');

module.exports = Reflux.createStore({

    // I want callbacks on these actions.
    listenables: [ BoxGraphicActions ],

    // Data model for box graphic state
    state: {
        data: {}
    },

    // Can be used to initialize users of this store.
    getInitialState: function() {
        return this.state;
    },

    // Callback for VlanActions.loadVlansCompleted
    onLoadBoxGraphicCompleted: function(data) {
        this.state.data = data;
        this.trigger(this.state);
    }

});
