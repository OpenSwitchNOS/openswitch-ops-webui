/*
 * Test Store.
 * @author Kelsey Dedoshka
 */

describe('Test Suite For PortsMgmtStore', function() {

    var PortsMgmtStore,
        RestUtils;

    var ports = {
        test1: {
            url: 'system/Interface/1',
            data: 1
        },
        test2: {
            url: 'system/Interface/34',
            data: 34
        },
        test3: {
            urls: {
                url1: 'system/Interface/2',
                url2: 'system/Interface/4',
                url3: 'system/Interface/10',
                url4: 'system/Interface/17',
                url5: 'system/Interface/24',
                url6: 'system/Interface/37',
                url7: 'system/Interface/52',
            },
            data: {
                data1: 2,
                data2: 4,
                data3: 10,
                data4: 17,
                data5: 24,
                data6: 37,
                data7: 52
            },
            status: {
                status1: { 2: 'up' },
                status2: { 4: 'up' },
                status3: { 10: 'down' }
            }
        }
    };

    beforeEach(function() {
        RestUtils = require('restUtils');
        PortsMgmtStore = require('PortsMgmtStore');
    });

    it('correct initial state of the store', function() {
        expect(PortsMgmtStore.state.allPorts).toEqual([]);
        expect(PortsMgmtStore.state.portStatus).toEqual({});
    });

    it('sets single port into all ports into state.allPorts', function() {

        var err, result;

        // TEST 1
        AjaxStubRequest(ports.test1.url, ports.test1.data);

        RestUtils.get(ports.test1.url, function(e, r) {
            err = e;
            result = r;
        });

        jasmine.clock().tick(); // allow action
        expect(err).toBeNull();
        expect(result.body).toEqual(1);


        // TEST 2
        AjaxStubRequest(ports.test2.url, ports.test2.data);

        RestUtils.get(ports.test2.url, function(e, r) {
            err = e;
            result = r;
        });

        jasmine.clock().tick(); // allow action
        expect(err).toBeNull();
        expect(result.body).toEqual(34);

    });

    it('sets list of ports into all ports in state.allPorts', function() {

        var err, result;

        //TEST 3
        AjaxStubRequest(ports.test3.urls.url1, ports.test3.data.data1);
        AjaxStubRequest(ports.test3.urls.url2, ports.test3.data.data2);
        AjaxStubRequest(ports.test3.urls.url3, ports.test3.data.data3);
        AjaxStubRequest(ports.test3.urls.url4, ports.test3.data.data4);
        AjaxStubRequest(ports.test3.urls.url5, ports.test3.data.data5);
        AjaxStubRequest(ports.test3.urls.url6, ports.test3.data.data6);
        AjaxStubRequest(ports.test3.urls.url7, ports.test3.data.data7);

        RestUtils.get([ports.test3.urls.url1,
            ports.test3.urls.url2,
            ports.test3.urls.url3,
            ports.test3.urls.url4,
            ports.test3.urls.url5,
            ports.test3.urls.url6,
            ports.test3.urls.url7], function(e, r) {
                err = e;
                result = r;
            });

        jasmine.clock().tick();
        expect(err).toBeNull();
        expect(result.map(function(item) {
            return item.body;
        })).toEqual([2, 4, 10, 17, 24, 37, 52]);

    });

    it('sets the list of port status in state.portStatus', function() {
        var err, result;

        //TEST 4
        AjaxStubRequest(ports.test3.urls.url1, ports.test3.status.status1);
        AjaxStubRequest(ports.test3.urls.url2, ports.test3.status.status2);
        AjaxStubRequest(ports.test3.urls.url3, ports.test3.status.status3);

        RestUtils.get([
                ports.test3.urls.url1,
                ports.test3.urls.url2,
                ports.test3.urls.url3
            ], function(e, r) {
                err = e;
                result = r;
            });

        jasmine.clock().tick();
        expect(err).toBeNull();
        expect(result.map(function(item) {
            return item.body;
        })).toEqual([{ 2: 'up' }, { 4: 'up' }, { 10: 'down' }]);
    });

});
