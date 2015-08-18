/*
 * General store for interface statistics.
 * @author Frank Wood
 */

var Reflux = require('reflux'),
    InterfaceActions = require('InterfaceActions'),
    Lodash = require('lodash');

module.exports = Reflux.createStore({

    listenables: [ InterfaceActions ],

    state: {
        timestampMillis: 0,
        interfaces: {},
        topUtilization: [],
    },

    getInitialState: function() {
        return this.state;
    },

    utl: function(speed, prevBytes, currBytes, intervalMs) {
        var maxBytesPerSec, bytesPerSec, utilization;
        if (speed <= 0 || currBytes < prevBytes) {
            return 0;
        }
        maxBytesPerSec = speed / 8;
        bytesPerSec = (currBytes - prevBytes) / (intervalMs / 1000);
        utilization = 100 * (bytesPerSec / maxBytesPerSec);
        return (utilization > 100) ? 100 : utilization;
    },

    processInterfaces: function(interfaces) {
        var currTsMillis = new Date().getTime(),
            interMs = currTsMillis - this.state.timestampMillis,
            i, ci, pi,
            topUtls = [],
            ciMap = {};

        if (interMs === 0) {
            return; // can't determine rate 0 milliseconds between updates
        }

        // create a new array of 'up' interfaces, calculating utilization
        for (i=0; i<interfaces.length; i++) {

            if (interfaces[i].link !== 'up') {
                continue;
            }

            ci = Lodash.cloneDeep(interfaces[i]); // keep immutable
            ciMap[ci.name] = ci;

            pi = this.state.interfaces[ci.name];

            if (!pi || pi.duplex !== ci.duplex || pi.speed !== ci.speed) {
                continue;
            }

            if (ci.duplex === 'full') {
                ci.rxUtl = this.utl(ci.speed, pi.rxBytes, ci.rxBytes, interMs);
                topUtls.push({ utl: ci.rxUtl, dir: 'rx', ci: ci });

                ci.txUtl = this.utl(ci.speed, pi.txBytes, ci.txBytes, interMs);
                topUtls.push({ utl: ci.txUtl, dir: 'tx', ci: ci });

            } else if (ci.duplex === 'half') {

                ci.txUtl = ci.rxUtl = this.utl(
                    ci.speed,
                    pi.txBytes + pi.rxBytes,
                    ci.txBytes + ci.rxBytes,
                    interMs);
                topUtls.push({ utl: ci.txUtl, dir: 'txRx', ci: ci });
            }

        };

        topUtls = topUtls.sort(function(top1, top2) {
            return top2.utl - top1.utl;
        });

        this.state.timestampMillis = currTsMillis;
        this.state.topUtilization = topUtls.slice(0, 5);
        this.state.interfaces = ciMap;
    },

    onLoadCompleted: function(interfaces) {
        this.processInterfaces(interfaces);
        this.trigger(this.state);
    }

});
