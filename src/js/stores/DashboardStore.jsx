/*
 * The store for the dashboard view.
 * @author Frank Wood
 */

var Reflux = require('reflux'),
    SystemInfoActions = require('SystemInfoActions'),
    SystemStatsActions = require('SystemStatsActions'),
    InterfaceStatsStore = require('InterfaceStatsStore');

module.exports = Reflux.createStore({

    init: function() {
        this.listenTo(SystemInfoActions.load.completed, 'onInfo');
        this.listenTo(SystemStatsActions.load.completed, 'onStats');
        this.listenTo(InterfaceStatsStore, 'onInterfaceStats');
    },

    state: {
        sysInfo: {},
        sysStats: {
            fans: [],
            powerSupplies: []
        },
        interfaceStats: {}
    },

    getInitialState: function() {
        return this.state;
    },

    onInfo: function(info) {
        this.state.sysInfo = info;
        this.trigger(this.state);
    },

    onStats: function(stats) {
        this.state.sysStats = stats;
        this.trigger(this.state);
    },

    onInterfaceStats: function(interfaceStats) {
        this.state.interfaceStats = interfaceStats;
        this.trigger(this.state);
    }

});
