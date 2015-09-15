/*
 * Server configuration store.
 * @author Frank Wood
 */

var Reflux = require('reflux'),
    ServerConfigActions = require('ServerConfigActions');

module.exports = Reflux.createStore({

    listenables: [ ServerConfigActions ],

    getInitialState: function() {
        return {
            isInitialized: localStorage.isServerInitialized,
        };
    },

    isInitialized: function() {
        return !!localStorage.isServerInitialized;
    },

    onInitCompleted: function() {
        localStorage.isServerInitialized = true;
        this.trigger({
            isInitialized: localStorage.isServerInitialized
        });
    },

    onReset: function() {
        delete localStorage.isServerInitialized;
        this.trigger({
            isInitialized: false
        });
    }

});
