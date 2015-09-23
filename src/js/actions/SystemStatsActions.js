/*
 (C) Copyright 2015 Hewlett Packard Enterprise Development LP

    Licensed under the Apache License, Version 2.0 (the "License"); you may
    not use this file except in compliance with the License. You may obtain
    a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
    License for the specific language governing permissions and limitations
    under the License.
*/

/*
 * Actions for System statistics (frequently changes).
 */

// TODO: make action file names consistent with stores (Port vs Ports).

var Reflux = require('reflux'),
    RestUtils = require('restUtils'),
    RenderActions = require('RenderActions');

var SystemStatsActions = Reflux.createActions({
    load: { asyncResult: true },
});

var URLS_PASS_1 = [
    '/rest/v1/system/subsystems/base/temp_sensors',
    '/rest/v1/system/subsystems/base/fans',
    '/rest/v1/system/subsystems/base/power_supplies'
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

function processPass2(res) {
    var cpu, mem, stor,
        date = Date.parse(res[0].headers.date),
        result = {
            date: (date ? date : 0)
        },
        stats = res[0].body.statistics.statistics;

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

    result.temps = res[1].map(function(r) {
        return {
            name: r.body.status.name,
            loc: r.body.status.location,
            max: Number(r.body.status.max) / 1000,
            min: Number(r.body.status.min) / 1000,
            val: Number(r.body.status.temperature) / 1000
        };
    });
    // FIXME: where should we put this?
    result.temps.sort(function(t1, t2) {
        if (t1.name < t2.name) {
            return -1;
        }
        if (t1.name > t2.name) {
            return 1;
        }
        return 0;
    });

    result.fans = res[2].map(function(r) {
        var textStatus = processFanStatus(r.body.status.status);
        return {
            name: r.body.status.name,
            text: textStatus.text,
            status: textStatus.status
        };
    });

    result.powerSupplies = res[3].map(function(r) {
        var textStatus = processPwrStatus(r.body.status.status);
        return {
            name: r.body.status.name,
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
                '/rest/v1/system',
                pass1[0].body,
                pass1[1].body,
                pass1[2].body,
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
