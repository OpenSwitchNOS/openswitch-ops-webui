/*
 * Test.
 * @author Frank Wood
 */

describe('Test Suite For SystemStatsActions', function() {

    var temp1 = {
            testUrl: '/rest/v1/system/subsystems/base/temp_sensors/base-1',
            body: {
                status: {
                    location: 'U1',
                    max: '31500',
                    min: '27500',
                    name: 'base-1',
                    status: 'normal',
                    temperature: '31000'
                }
            },
            processed: {
                name: 'base-1',
                loc: 'U1',
                max: 31.5,
                min: 27.5,
                val: 31
            }
        },
        temp2 = {
            testUrl: '/rest/v1/system/subsystems/base/temp_sensors/base-2',
            body: {
                status: {
                    location: 'U2',
                    max: '32500',
                    min: '27440',
                    name: 'base-2',
                    status: 'normal',
                    temperature: '31590'
                }
            },
            processed: {
                name: 'base-2',
                loc: 'U2',
                max: 32.5,
                min: 27.44,
                val: 31.59
            }
        },
        fan1 = {
            testUrl: '/rest/v1/system/subsystems/base/fans/f1',
            body: {
                status: {
                    name: 'f1',
                    status: 'ok'
                }
            },
            processed: {
                name: 'f1',
                text: 'ok',
                status: 'ok'
            }
        },
        fan2 = {
            testUrl: '/rest/v1/system/subsystems/base/fans/f2',
            body: {
                status: {
                    name: 'f2',
                    status: 'fault'
                }
            },
            processed: {
                name: 'f2',
                text: 'fanFault',
                status: 'error'
            }
        },
        fan3 = {
            testUrl: '/rest/v1/system/subsystems/base/fans/f3',
            body: {
                status: {
                    name: 'f3',
                    status: 'uninitialized'
                }
            },
            processed: {
                name: 'f3',
                text: 'fanUninitialized',
                status: 'warning'
            }
        },
        pwr1 = {
            testUrl: '/rest/v1/system/subsystems/base/power_supplies/base-1',
            body: {
                status: {
                    name: 'base-1',
                    status: 'ok'
                }
            },
            processed: {
                name: 'base-1',
                text: 'ok',
                status: 'ok'
            }
        },
        pwr2 = {
            testUrl: '/rest/v1/system/subsystems/base/power_supplies/base-2',
            body: {
                status: {
                    name: 'base-2',
                    status: 'fault_input'
                }
            },
            processed: {
                name: 'base-2',
                text: 'powerFaultInput',
                status: 'warning'
            }
        },
        pwr3 = {
            testUrl: '/rest/v1/system/subsystems/base/power_supplies/base-3',
            body: {
                status: {
                    name: 'base-3',
                    status: 'fault_output'
                }
            },
            processed: {
                name: 'base-3',
                text: 'powerFaultOutput',
                status: 'error'
            }
        },
        pwr4 = {
            testUrl: '/rest/v1/system/subsystems/base/power_supplies/base-4',
            body: {
                status: {
                    name: 'base-4',
                    status: 'absent'
                }
            },
            processed: {
                name: 'base-4',
                text: 'powerAbsent',
                status: 'warning'
            }
        },
        pass1temps = {
            testUrl: '/rest/v1/system/subsystems/base/temp_sensors',
            body: [ temp1.testUrl, temp2.testUrl ]
        },
        pass1fans = {
            testUrl: '/rest/v1/system/subsystems/base/fans',
            body: [ fan1.testUrl, fan2.testUrl, fan3.testUrl ]
        },
        pass1pwrs = {
            testUrl: '/rest/v1/system/subsystems/base/power_supplies',
            body: [ pwr1.testUrl, pwr2.testUrl, pwr3.testUrl, pwr4.testUrl ]
        },
        sys = {
            testUrl: '/rest/v1/system',
            body: {
                statistics: {
                    statistics: {
                        'load_average': '1.95,1.88,1.43',
                        memory: '8167696,2097440,618016,0,0',
                        'file_systems': '/,1998672,289484'
                    }
                }
            }
        },
        processed = {
            cpuVal: 1.95,
            cpuMax: 5,
            memVal: 2.097440,
            memMax: 8.167696,
            storVal: 0.289484,
            storMax: 1.998672,
            temps: [ temp1.processed, temp2.processed ],
            fans: [
                fan1.processed,
                fan2.processed,
                fan3.processed
            ],
            powerSupplies: [
                pwr1.processed,
                pwr2.processed,
                pwr3.processed,
                pwr4.processed
            ],
            date: 0
        },
        SystemStatsActions,
        RenderActions; // FIXME: rename this

    beforeEach(function() {
        SystemStatsActions = require('SystemStatsActions');
        RenderActions = require('RenderActions');
    });

    it('completes correctly', function() {
        AjaxStubRequest(pass1temps.testUrl, pass1temps.body);
        AjaxStubRequest(pass1fans.testUrl, pass1fans.body);
        AjaxStubRequest(pass1pwrs.testUrl, pass1pwrs.body);
        AjaxStubRequest(temp1.testUrl, temp1.body);
        AjaxStubRequest(temp2.testUrl, temp2.body);
        AjaxStubRequest(fan1.testUrl, fan1.body);
        AjaxStubRequest(fan2.testUrl, fan2.body);
        AjaxStubRequest(fan3.testUrl, fan3.body);
        AjaxStubRequest(pwr1.testUrl, pwr1.body);
        AjaxStubRequest(pwr2.testUrl, pwr2.body);
        AjaxStubRequest(pwr4.testUrl, pwr4.body);
        AjaxStubRequest(pwr3.testUrl, pwr3.body);
        AjaxStubRequest(sys.testUrl, sys.body);

        spyOn(SystemStatsActions.load, 'completed');
        spyOn(RenderActions, 'postRequestErr');

        SystemStatsActions.load();
        jasmine.clock().tick(); // allow action

        expect(SystemStatsActions.load.completed).toHaveBeenCalledWith(
            processed
        );

        expect(RenderActions.postRequestErr.calls.count()).toEqual(0);
    });

    it('fails the first pass correctly', function() {
        AjaxStubRequest(pass1temps.testUrl, pass1temps.body);
        AjaxStubRequest(pass1fans.testUrl, pass1fans.body, 500);
        AjaxStubRequest(pass1pwrs.testUrl, pass1pwrs.body);

        spyOn(SystemStatsActions.load, 'completed');
        spyOn(RenderActions, 'postRequestErr');

        SystemStatsActions.load();
        jasmine.clock().tick(); // allow action

        expect(SystemStatsActions.load.completed.calls.count()).toEqual(0);
        expect(RenderActions.postRequestErr.calls.count()).toEqual(1);
    });

    it('fails the second pass correctly', function() {
        AjaxStubRequest(pass1temps.testUrl, pass1temps.body);
        AjaxStubRequest(pass1fans.testUrl, pass1fans.body);
        AjaxStubRequest(pass1pwrs.testUrl, pass1pwrs.body);
        AjaxStubRequest(temp1.testUrl, temp1.body);
        AjaxStubRequest(temp2.testUrl, temp2.body);
        AjaxStubRequest(fan1.testUrl, fan1.body);
        AjaxStubRequest(fan2.testUrl, fan2.body);
        AjaxStubRequest(fan3.testUrl, fan3.body);
        AjaxStubRequest(pwr1.testUrl, pwr1.body);
        AjaxStubRequest(pwr2.testUrl, {}, 500);
        AjaxStubRequest(pwr3.testUrl, pwr3.body);
        AjaxStubRequest(pwr4.testUrl, pwr4.body);
        AjaxStubRequest(sys.testUrl, sys.body);

        spyOn(SystemStatsActions.load, 'completed');
        spyOn(RenderActions, 'postRequestErr');

        SystemStatsActions.load();
        jasmine.clock().tick(); // allow action

        expect(SystemStatsActions.load.completed.calls.count()).toEqual(0);
        expect(RenderActions.postRequestErr.calls.count()).toEqual(1);
    });

});
