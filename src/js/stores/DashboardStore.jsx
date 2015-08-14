/*
 * The store for the dashboard view.
 * @author Frank Wood
 */

var Reflux = require('reflux'),
    SystemInfoActions = require('SystemInfoActions'),
    SystemStatsActions = require('SystemStatsActions'),
    TopUtilizationActions = require('TopUtilizationActions');

module.exports = Reflux.createStore({

    init: function() {
        this.joinTrailing(
            SystemInfoActions.load.completed,
            SystemStatsActions.load.completed,
            TopUtilizationActions.load.completed,
            this.onAllCompleted
        );

        this.listenTo(SystemInfoActions.load.failed, this.onAnyFailed);
        this.listenTo(SystemStatsActions.load.failed, this.onAnyFailed);
        this.listenTo(TopUtilizationActions.load.failed, this.onAnyFailed);
    },

    // Data model.
    state: {
        sysInfo: { },
        sysStats: {
            cpu: 0, cpu_max: 0,
            stor: 0, stor_max: 0,
            mem: 0, mem_max: 0,
            temp: 0, temp_max: 0
        },
        topUtilPorts: { },
        topUtilVlans: { }
    },

    getInitialState: function() {
        return this.state;
    },

    onAnyFailed: function(data) {
        console.log('DashboardStore.onAnyFailed:');
        console.log(data);
    },

    onAllCompleted: function(sysInfo, sysStats, topUtil) {
        console.log('DashboardStore.onAllCompleted:');
        this.state.sysInfo = sysInfo[0];
        this.state.sysStats = sysStats[0];
        this.state.topUtilPorts = topUtil[0][0];
        this.state.topUtilVlans = topUtil[0][1];
        console.log(this.state);
        this.trigger(this.state);
    }

});
