/*
 * Actions for System statistics (frequently changes).
 * @author Frank Wood
 */

// TODO: make action file names consistent with stores (Port vs Ports).

var Reflux = require('reflux'),
    RestUtils = require('restUtils'),
    RenderActions = require('RenderActions');

var SystemStatsActions = Reflux.createActions({
    load: { asyncResult: true },
});

var URLS_PASS_1 = [
    '/system/subsystems/base/temp_sensors',
    '/system/subsystems/base/fans',
    '/system/subsystems/base/power_supplies'
];

function processCsvCpu(data) {
    return {
        val: Number(data.split(',')[0]),
        max: 5
    };
}

function processCsvKbMaxVal(data, startIdx) {
    return {
        max: Number(data.split(',')[startIdx]) / 1000000,
        val: Number(data.split(',')[startIdx+1]) / 1000000
    };
}

function processFanStatus(result) {
    if (result === 'ok') {
        return { text: 'ok', status: 'ok' };
    } else if (result === 'fault') {
        return { text: 'fanFault', status: 'error' };
    }
    return { text: 'fanUninitialized', status: 'warning' };
}

function processPwrStatus(result) {
    if (result === 'ok') {
        return { text: 'ok', status: 'ok' };
    } else if (result === 'fault_input') {
        return { text: 'powerFaultInput', status: 'warning' };
    } else if (result === 'fault_output') {
        return { text: 'powerFaultOutput', status: 'error' };
    }
    return { text: 'powerAbsent', status: 'warning' };
}

function processPass2(resBody) {
    var cpu, mem, stor,
        date = resBody[0].date,
        result = {
            date: (date ? date : 0)
        },
        stats = resBody[0].data.statistics;

    if (stats) {
        cpu = processCsvCpu(stats.load_average);
        mem = processCsvKbMaxVal(stats.memory, 0);
        stor = processCsvKbMaxVal(stats.file_systems, 1);

        result.cpuVal = cpu.val;
        result.cpuMax = cpu.max;
        result.memVal = mem.val;
        result.memMax = mem.max;
        result.storVal = stor.val;
        result.storMax = stor.max;
    }

    result.temps = resBody[1].map(function(item) {
        return {
            name: item.data.name,
            loc: item.data.location,
            max: Number(item.data.max) / 1000,
            min: Number(item.data.min) / 1000,
            val: Number(item.data.temperature) / 1000
        };
    });

    result.fans = resBody[2].map(function(item) {
        var textStatus = processFanStatus(item.data.status);
        return {
            name: item.data.name,
            text: textStatus.text,
            status: textStatus.status
        };
    });

    result.powerSupplies = resBody[3].map(function(item) {
        var textStatus = processPwrStatus(item.data.status);
        return {
            name: item.data.name,
            text: textStatus.text,
            status: textStatus.status
        };
    });

    return result;
}

SystemStatsActions.load.listen(function() {
    RestUtils.get(URLS_PASS_1, function(e1, pass1) {
        var urlsPass2;
        if (e1) {
            this.failed(e1);
        } else {
            urlsPass2 = [
                '/system',
                pass1[0].data,
                pass1[1].data,
                pass1[2].data,
            ];
            RestUtils.get(urlsPass2, function(e2, pass2) {
                if (e2) {
                    this.failed(e2);
                } else {
                    this.completed(processPass2(pass2));
                }
            }.bind(this));
        }
    }.bind(this));
});

SystemStatsActions.load.failed.listen(function(err) {
    RenderActions.postRequestErr(err);
});

module.exports = SystemStatsActions;