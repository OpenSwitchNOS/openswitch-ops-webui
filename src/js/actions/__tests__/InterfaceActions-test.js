/*
 * Test.
 * @author Frank Wood
 */

describe('Test Suite For InterfaceActions', function() {

    var infs = {
            testUrl: '/rest/v1/system/interfaces',
            body: [
                '/rest/v1/system/interface/INF-0',
                '/rest/v1/system/interface/INF-1',
                '/rest/v1/system/interface/INF-2'
            ]
        },
        inf0 = {
            testUrl: '/rest/v1/system/interface/INF-0',
            body: {
                configuration: {
                    name: 'inf0',
                    type: 'system'
                },
                statistics: {
                    statistics: {
                        'rx_bytes': '111',
                        'tx_bytes': '222'
                    }
                },
                status: {
                    'link_state': 'up',
                    duplex: 'full',
                    'link_speed': '1000000000'
                }
            },
            processed: {
                link: 'up',
                duplex: 'full',
                speed: 1000000000,
                name: 'inf0',
                rxBytes: 111,
                txBytes: 222
            }
        },
        inf1 = {
            testUrl: '/rest/v1/system/interface/INF-1',
            body: {
                configuration: {
                    name: 'inf1',
                    type: 'system'
                },
                statistics: {
                    statistics: {
                        'rx_bytes': '333',
                        'tx_bytes': '444'
                    }
                },
                status: {
                    'link_state': 'down',
                    duplex: 'half',
                    'link_speed': '100000000'
                }
            },
            processed: {
                link: 'down',
                duplex: 'half',
                speed: 100000000,
                name: 'inf1',
                rxBytes: 333,
                txBytes: 444
            }
        },
        inf2 = {
            testUrl: '/rest/v1/system/interface/INF-2',
            body: {
                configuration: {
                    name: 'inf2',
                    type: 'bogus'
                }
            }
        },
        InterfaceActions,
        RenderActions; // FIXME: rename this

    beforeEach(function() {
        InterfaceActions = require('InterfaceActions');
        RenderActions = require('RenderActions');
    });

    it('completes correctly ignoring non system interfaces', function() {
        AjaxStubRequest(infs.testUrl, infs.body);
        AjaxStubRequest(inf0.testUrl, inf0.body);
        AjaxStubRequest(inf1.testUrl, inf1.body);
        AjaxStubRequest(inf2.testUrl, inf2.body);

        spyOn(InterfaceActions.load, 'completed');
        spyOn(RenderActions, 'postRequestErr');

        InterfaceActions.load();
        jasmine.clock().tick(); // allow action

        expect(InterfaceActions.load.completed).toHaveBeenCalledWith([
            inf0.processed, inf1.processed
        ]);

        expect(RenderActions.postRequestErr.calls.count()).toEqual(0);
    });

    it('fails the first pass correctly', function() {
        AjaxStubRequest(infs.testUrl, {}, 500);

        spyOn(InterfaceActions.load, 'completed');
        spyOn(RenderActions, 'postRequestErr');

        InterfaceActions.load();
        jasmine.clock().tick(); // allow action

        expect(InterfaceActions.load.completed.calls.count()).toEqual(0);
        expect(RenderActions.postRequestErr.calls.count()).toEqual(1);
    });

    it('fails the second pass correctly', function() {
        AjaxStubRequest(infs.testUrl, infs.body);
        AjaxStubRequest(inf0.testUrl, inf0.body);
        AjaxStubRequest(inf1.testUrl, {}, 500);
        AjaxStubRequest(inf2.testUrl, inf2.body);

        spyOn(InterfaceActions.load, 'completed');
        spyOn(RenderActions, 'postRequestErr');

        InterfaceActions.load();
        jasmine.clock().tick(); // allow action

        expect(InterfaceActions.load.completed.calls.count()).toEqual(0);
        expect(RenderActions.postRequestErr.calls.count()).toEqual(1);
    });

});
