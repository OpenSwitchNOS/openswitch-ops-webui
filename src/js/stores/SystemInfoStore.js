/*
 * The store for system info (product, location, etc.).
 * @author Frank Wood
 */

var Reflux = require('reflux'),
    SystemInfoActions = require('SystemInfoActions');

module.exports = Reflux.createStore({

    // I want callbacks on these actions.
    listenables: [ SystemInfoActions ],

    // Data model.
    state: {
        name: 'unknown',
        contact: 'unknown',
        location: 'unknown',
        product: 'unknown',
        upTime: 'unknown'
    },

    // Can be used to initialize users of this store.
    getInitialState: function() {
        return this.state;
    },

    onLoadCompleted: function(data) {
        this.state = data;
        this.trigger(this.state);
    },

    onSubmitCompleted: function(data) {
        this.state = data;
        this.trigger(this.state);
    }

});
