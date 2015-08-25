/*
 * Test.
 * @author Frank Wood
 */

describe('Test Suite For SystemStatsActions', function() {

    var temp1 = {
            testUrl: '/system/subsystems/base/temp_sensors/base-1',
            data: {
                location: 'U1',
                max: '31500',
                min: '27500',
                name: 'base-1',
                status: 'normal',
                temperature: '31000'
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
            testUrl: '/system/subsystems/base/temp_sensors/base-2',
            data: {
                location: 'U2',
                max: '32500',
                min: '27440',
                name: 'base-2',
                status: 'normal',
                temperature: '31590'
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
            testUrl: '/system/subsystems/base/fans/a1',
            data: {
                name: 'base-FAN 2R',
                status: 'ok'
            }
        },
        fan2 = {
            testUrl: '/system/subsystems/base/fans/a2',
            data: {
                name: 'base-FAN 5L',
                status: 'ok'
            }
        },
        pwr1 = {
            testUrl: '/system/subsystems/base/power_supplies/base-1',
            data: {
                name: 'base-1',
                status: 'ok'
            }
        },
        pwr2 = {
            testUrl: '/system/subsystems/base/power_supplies/base-2',
            data: {
                name: 'base-2',
                status: 'ok'
            }
        },
        pass1temps = {
            testUrl: '/system/subsystems/base/temp_sensors',
            data: [ temp1.testUrl, temp2.testUrl ]
        },
        pass1fans = {
            testUrl: '/system/subsystems/base/fans',
            data: [ fan1.testUrl, fan2.testUrl ]
        },
        pass1pwrs = {
            testUrl: '/system/subsystems/base/power_supplies',
            data: [ pwr1.testUrl, pwr2.testUrl ]
        },
        sys = {
            testUrl: '/system',
            data: {
                statistics: {
                    'load_average': '1.95,1.88,1.43',
                    memory: '8167696,2097440,618016,0,0',
                    'file_systems': '/,1998672,289484'
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
            fans: [ fan1.data, fan2.data ],
            powerSupplies: [ pwr1.data, pwr2.data ]
        },
        SystemStatsActions,
        RenderActions; // FIXME: rename this

    beforeEach(function() {
        SystemStatsActions = require('SystemStatsActions');
        RenderActions = require('RenderActions');
    });

    it('completes correctly', function() {
        AjaxStubRequest(pass1temps.testUrl, pass1temps);
        AjaxStubRequest(pass1fans.testUrl, pass1fans);
        AjaxStubRequest(pass1pwrs.testUrl, pass1pwrs);
        AjaxStubRequest(temp1.testUrl, temp1);
        AjaxStubRequest(temp2.testUrl, temp2);
        AjaxStubRequest(fan1.testUrl, fan1);
        AjaxStubRequest(fan2.testUrl, fan2);
        AjaxStubRequest(pwr1.testUrl, pwr1);
        AjaxStubRequest(pwr2.testUrl, pwr2);
        AjaxStubRequest(sys.testUrl, sys);

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
        AjaxStubRequest(pass1temps.testUrl, pass1temps);
        AjaxStubRequest(pass1fans.testUrl, pass1fans, 500);
        AjaxStubRequest(pass1pwrs.testUrl, pass1pwrs);

        spyOn(SystemStatsActions.load, 'completed');
        spyOn(RenderActions, 'postRequestErr');

        SystemStatsActions.load();
        jasmine.clock().tick(); // allow action

        expect(SystemStatsActions.load.completed.calls.count()).toEqual(0);
        expect(RenderActions.postRequestErr.calls.count()).toEqual(1);
    });

    it('fails the second pass correctly', function() {
        AjaxStubRequest(pass1temps.testUrl, pass1temps);
        AjaxStubRequest(pass1fans.testUrl, pass1fans);
        AjaxStubRequest(pass1pwrs.testUrl, pass1pwrs);
        AjaxStubRequest(temp1.testUrl, temp1);
        AjaxStubRequest(temp2.testUrl, temp2);
        AjaxStubRequest(fan1.testUrl, fan1);
        AjaxStubRequest(fan2.testUrl, fan2);
        AjaxStubRequest(pwr1.testUrl, pwr1);
        AjaxStubRequest(pwr2.testUrl, {}, 500);
        AjaxStubRequest(sys.testUrl, sys);

        spyOn(SystemStatsActions.load, 'completed');
        spyOn(RenderActions, 'postRequestErr');

        SystemStatsActions.load();
        jasmine.clock().tick(); // allow action

        expect(SystemStatsActions.load.completed.calls.count()).toEqual(0);
        expect(RenderActions.postRequestErr.calls.count()).toEqual(1);
    });

});
