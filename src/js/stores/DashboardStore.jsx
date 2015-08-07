/*
 * The store for the dashboard view.
 * @author Frank Wood
 */

var Reflux = require('reflux'),
DashboardActions = require('DashboardActions');

module.exports = Reflux.createStore({

    listenables: [ DashboardActions ],

    // Data model.
    state: {
        sysInfo: { }
    },

    getInitialState: function() {
        return this.state;
    },

    onLoadSysInfoCompleted: function(data) {
        this.state.sysInfo = data;
        this.trigger(this.state);
    }

});
