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
        sysStats: { },
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

    processPorts: function(ports) {
        var sortedPorts = ports.sort(function(p1, p2) {
            var p1Val = 0,
                p2Val = 0;
            if (p1.stats && p1.stats.utilization) {
                p1Val = p1.stats.utilization;
            }
            if (p2.stats && p2.stats.utilization) {
                p2Val = p2.stats.utilization;
            }
            return p2Val - p1Val;
        });
        return sortedPorts.slice(0, 5);
    },

    processVlans: function(vlans) {
        var sortedVlans = vlans.sort(function(p1, p2) {
            var p1Val = 0,
                p2Val = 0;
            if (p1.stats && p1.stats.utilization) {
                p1Val = p1.stats.utilization;
            }
            if (p2.stats && p2.stats.utilization) {
                p2Val = p2.stats.utilization;
            }
            return p2Val - p1Val;
        });
        return sortedVlans.slice(0, 5);
    },

    onAllCompleted: function(sysInfo, sysStats, topUtil) {
        console.log('DashboardStore.onAllCompleted:');
        this.state.sysInfo = sysInfo[0];
        this.state.sysStats = sysStats[0];
        this.state.topUtilPorts = this.processPorts(topUtil[0][0]);
        this.state.topUtilVlans = this.processVlans(topUtil[0][1]);
        console.log(this.state);
        this.trigger(this.state);
    }

});
