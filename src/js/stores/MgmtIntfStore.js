/*
 * Management Interface store.
 * @author Al Harrington
 */

var Reflux = require('reflux'),
    MgmtIntfActions = require('MgmtIntfActions');

module.exports = Reflux.createStore({

    listenables: [ MgmtIntfActions ],

    state: {
    },

    getInitialState: function() {
        return this.state;
    },

    onLoadCompleted: function(data) {
        this.state = data;
        this.trigger(this.state);
    },

});
