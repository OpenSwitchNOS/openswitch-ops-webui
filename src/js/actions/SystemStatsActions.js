/*
 * Actions for System statistics (frequently changes).
 * @author Frank Wood
 */

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

function divideBy1000(val) {
    return (val / 1000).toFixed(1);
}

function divideBy1000000(val) {
    return (val / 1000000).toFixed(1);
}

function processCsvKbMaxVal(data, startIdx) {
    return {
        max: divideBy1000000(Number(data.split(',')[startIdx])),
        val: divideBy1000000(Number(data.split(',')[startIdx+1]))
    };
}

SystemStatsActions.load.listen(function() {
    // Get the temp sensor URLs first.
    RestUtils.get('/system/subsystems/base/temp_sensors', function(e1, rb1) {
        if (e1) {
            this.failed(e1);
        } else {
            // Get the temp sensor data and the system data
            RestUtils.get([rb1.data, '/system'], function(e2, rb2) {
                var temps,
                    stats = rb2[1].data.statistics,
                    cpu = processCsvFirst(stats.load_average),
                    mem = processCsvKbMaxVal(stats.memory, 0),
                    stor = processCsvKbMaxVal(stats.file_systems, 1);

                temps = rb2[0].map(function(item) {
                    return {
                        name: item.data.name,
                        loc: item.data.location,
                        max: divideBy1000(Number(item.data.max)),
                        min: divideBy1000(Number(item.data.min)),
                        val: divideBy1000(Number(item.data.temperature))
                    };
                });

                this.completed({
                    cpuVal: cpu.val,
                    cpuMax: cpu.max,
                    memVal: mem.val,
                    memMax: mem.max,
                    storVal: stor.val,
                    storMax: stor.max,
                    temps: temps
                });

            }.bind(this));
        }
    }.bind(this));

    RestUtils.get('/system/subsystems/base/fans', function(e1, rb1) {
        if (e1) {
            this.failed(e1);
        } else {
            RestUtils.get([rb1.data], function(e2, rb2) {
                console.log(rb2);
            });
        }
    }.bind(this));

    RestUtils.get('/system/subsystems/base/power_supplies', function(e1, rb1) {
        if (e1) {
            this.failed(e1);
        } else {
            RestUtils.get([rb1.data], function(e2, rb2) {
                console.log(rb2);
            });
        }
    }.bind(this));

});

module.exports = SystemStatsActions;
