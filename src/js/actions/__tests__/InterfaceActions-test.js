/*
 * Test.
 * @author Frank Wood
 */

describe('Test Suite For InterfaceActions', function() {

    var infs = {
            testUrl: '/system/Interface',
            data: [
                '/system/Interface/INF-0',
                '/system/Interface/INF-1'
            ]
        },
        inf0 = {
            testUrl: '/system/Interface/INF-0',
            data: {
                'link_state': [ 'up' ],
                duplex: [ 'full' ],
                'link_speed': [ '1000000000' ],
                name: 'inf0',
                statistics: {
                    'rx_bytes': '111',
                    'tx_bytes': '222'
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
            testUrl: '/system/Interface/INF-1',
            data: {
                'link_state': [ 'down' ],
                duplex: [ 'half' ],
                'link_speed': [ '100000000' ],
                name: 'inf1',
                statistics: {
                    'rx_bytes': '333',
                    'tx_bytes': '444'
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
        InterfaceActions,
        RenderActions; // FIXME: rename this

    beforeEach(function() {
        InterfaceActions = require('InterfaceActions');
        RenderActions = require('RenderActions');
    });

    it('completes correctly', function() {
        AjaxStubRequest(infs.testUrl, infs);
        AjaxStubRequest(inf0.testUrl, inf0);
        AjaxStubRequest(inf1.testUrl, inf1);

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
        AjaxStubRequest(infs.testUrl, infs);
        AjaxStubRequest(inf0.testUrl, inf0);
        AjaxStubRequest(inf1.testUrl, {}, 500);

        spyOn(InterfaceActions.load, 'completed');
        spyOn(RenderActions, 'postRequestErr');

        InterfaceActions.load();
        jasmine.clock().tick(); // allow action

        expect(InterfaceActions.load.completed.calls.count()).toEqual(0);
        expect(RenderActions.postRequestErr.calls.count()).toEqual(1);
    });

});
