/*
 * The store for the dashboard view.
 * @author Frank Wood
 */

var Reflux = require('reflux'),
    SystemInfoActions = require('SystemInfoActions'),
    SystemStatsActions = require('SystemStatsActions'),
    InterfaceActions = require('InterfaceActions'),
    InterfaceStatsStore = require('InterfaceStatsStore');

module.exports = Reflux.createStore({

    init: function() {
        this.joinTrailing(
            SystemInfoActions.load.completed,
            SystemStatsActions.load.completed,
            InterfaceStatsStore,
            this.onAllCompleted
        );

        this.listenTo(InterfaceActions.load.failed, this.onAnyFailed);
        this.listenTo(SystemInfoActions.load.failed, this.onAnyFailed);
        this.listenTo(SystemStatsActions.load.failed, this.onAnyFailed);
    },

    // Data model.
    // TODO: Make sure this is needed (cause not connected directly to view).
    state: {
        sysInfo: { },
        sysStats: {
            fans: [],
            powerSupplies: []
        },
        topUtilPorts: { }
    },

    getInitialState: function() {
        return this.state;
    },

    onAnyFailed: function(data) {
        console.log('DashboardStore.onAnyFailed:');
        console.log(data);
    },

    onAllCompleted: function(sysInfo, sysStats, interfacesStatsState) {
        this.state.sysInfo = sysInfo[0];
        this.state.sysStats = sysStats[0];
        this.state.interfaces = interfacesStatsState[0];
        this.trigger(this.state);
    }

});
