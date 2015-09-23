/*
 * Test.
 * @author Frank Wood
 */

describe('Test Suite For SystemInfoActions', function() {

    var ssbase = {
            testUrl: '/rest/v1/system/subsystems/base',
            body: {
                status: {
                    'other_info': {
                        'onie_version': '1.2.3',
                        'base_mac_address': '0a:0b:0c:0d:0e:0f',
                        'serial_number': '321',
                        vendor: 'hp',
                        'Product Name': 'halon',
                        'part_number': 'p#1',
                    }
                }
            }
        },
        sys = {
            testUrl: '/rest/v1/system',
            body: {
                configuration: {
                    hostname: 'alswitch.rose.hp.com'
                },
                status: {
                    'switch_version': 'v123'
                }
            }
        },
        processed = {
            hostName: 'alswitch.rose.hp.com',
            onieVersion: '1.2.3',
            baseMac: '0A:0B:0C:0D:0E:0F',
            serialNum: '321',
            vendor: 'hp',
            productName: 'halon',
            version: 'v123',
            partNum: 'p#1'
        },
        SystemInfoActions,
        RenderActions; // FIXME: rename this

    beforeEach(function() {
        SystemInfoActions = require('SystemInfoActions');
        RenderActions = require('RenderActions');
    });

    it('completes correctly', function() {
        AjaxStubRequest(sys.testUrl, sys.body);
        AjaxStubRequest(ssbase.testUrl, ssbase.body);

        spyOn(SystemInfoActions.load, 'completed');
        spyOn(RenderActions, 'postRequestErr');

        SystemInfoActions.load();
        jasmine.clock().tick(); // allow action

        expect(SystemInfoActions.load.completed).toHaveBeenCalledWith(
            processed
        );

        expect(RenderActions.postRequestErr.calls.count()).toEqual(0);
    });

    it('fails correctly', function() {
        AjaxStubRequest(sys.testUrl, sys.body);
        AjaxStubRequest(ssbase.testUrl, ssbase.body, 500);

        spyOn(SystemInfoActions.load, 'completed');
        spyOn(RenderActions, 'postRequestErr');

        SystemInfoActions.load();
        jasmine.clock().tick(); // allow action

        expect(SystemInfoActions.load.completed.calls.count()).toEqual(0);
        expect(RenderActions.postRequestErr.calls.count()).toEqual(1);
    });

});
