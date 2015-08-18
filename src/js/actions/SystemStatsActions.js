/*
 * Actions for System statistics (frequently changes).
 * @author Frank Wood
 */

// TODO: make action file names consistent with stores (Port vs Ports).

var Reflux = require('reflux'),
    RestUtils = require('restUtils');

var SystemStatsActions = Reflux.createActions({
    // Actions: load, loadFailed, loadCompleted
    load: { asyncResult: true },
});

function processCsvFirst(data) {
    return {
        val: Number(data.split(',')[0]).toFixed(1),
        max: 5
    };
}

function processCsvKbMaxVal(data, startIdx) {
    return {
        max: Number(data.split(',')[startIdx]) / 1000000,
        val: Number(data.split(',')[startIdx+1]) / 1000000
    };
}

var URLS_PASS_1 = [
    '/system/subsystems/base/temp_sensors',
    '/system/subsystems/base/fans',
    '/system/subsystems/base/power_supplies'
];

SystemStatsActions.load.listen(function() {
    RestUtils.get(URLS_PASS_1, function(e1, pass1) {
        var urlsPass2;
        if (e1) {
            this.failed(e1);
        } else {
            urlsPass2 = [
                pass1[0].data,
                pass1[1].data,
                pass1[2].data,
                '/system'
            ];
            RestUtils.get(urlsPass2, function(e2, pass2) {
                var temps, stats, cpu, mem, stor, fans, pwrs;

                if (e2) {
                    this.failed(e2);
                } else {
                    stats = pass2[3].data.statistics;
                    if (stats) {
                        cpu = processCsvFirst(stats.load_average);
                        mem = processCsvKbMaxVal(stats.memory, 0);
                        stor = processCsvKbMaxVal(stats.file_systems, 1);
                        temps = pass2[0].map(function(item) {
                            return {
                                name: item.data.name,
                                loc: item.data.location,
                                max: Number(item.data.max) / 1000,
                                min: Number(item.data.min) / 1000,
                                val: Number(item.data.temperature) / 1000
                            };
                        });
                        fans = pass2[1].map(function(item) {
                            return {
                                name: item.data.name,
                                status: item.data.status
                            };
                        });
                        pwrs = pass2[2].map(function(item) {
                            return {
                                name: item.data.name,
                                status: item.data.status
                            };
                        });

                        this.completed({
                            cpuVal: cpu.val,
                            cpuMax: cpu.max,
                            memVal: mem.val,
                            memMax: mem.max,
                            storVal: stor.val,
                            storMax: stor.max,
                            temps: temps,
                            fans: fans,
                            powerSupplies: pwrs
                        });
                    }
                }
            }.bind(this));
        }
    }.bind(this));
});

module.exports = SystemStatsActions;
