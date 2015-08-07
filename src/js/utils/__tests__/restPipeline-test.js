/*
 * Test.
 * @author Frank Wood
 */

describe('Test Suite For restPipeline', function() {

    var bridges = {
            // returned from GET /system/bridges
            data: [
                '/system/bridges/BRIDGE-0'
            ]
        },
        vlans = {
            // returned from GET /system/bridges/BRIDGE-0/vlans
            data: [
                '/system/bridges/BRIDGE-0/vlans/VLAN-0',
                '/system/bridges/BRIDGE-0/vlans/VLAN-1',
                '/system/bridges/BRIDGE-0/vlans/VLAN-2'
            ]
        },
        vlan0 = {
            // returned from GET /system/bridges/BRIDGE-0/vlans/VLAN-0
            name: 'vlan0'
        },
        vlan1 = {
            // returned from GET /system/bridges/BRIDGE-0/vlans/VLAN-1
            name: 'vlan1'
        },
        vlan2 = {
            // returned from GET /system/bridges/BRIDGE-0/vlans/VLAN-2
            name: 'vlan2'
        },
        ports = {
            // returned from GET /system/bridges/BRIDGE-0/ports
            data: [
                '/system/bridges/BRIDGE-0/ports/PORT-0',
                '/system/bridges/BRIDGE-0/ports/PORT-1'
            ]
        },
        port0 = {
            // returned from GET /system/bridges/BRIDGE-0/ports/PORT-0
            name: 'port0'
        },
        port1 = {
            // returned from GET /system/bridges/BRIDGE-0/ports/PORT-1
            name: 'port1'
        },
        infs = {
            // returned from GET /system/interfaces
            data: [
                '/system/interfaces/INF-0',
                '/system/interfaces/INF-1',
                '/system/interfaces/INF-2'
            ]
        },
        inf0 = {
            // returned from GET /system/interfaces/INF-0
            name: 'inf0'
        },
        inf1 = {
            // returned from GET /system/interfaces/INF-1
            name: 'inf1'
        },
        inf2 = {
            // returned from GET /system/interfaces/INF-2
            name: 'inf2'
        },
        RestPipeline;

    beforeEach(function() {
        RestPipeline = require('restPipeline');
    });

    it('get URL', function() {
        var actualErr, actualResult;

        AjaxStubRequest('/system/bridges', bridges);

        RestPipeline.get('/system/bridges', function(err, result) {
            actualErr = err;
            actualResult = result;
        });

        expect(actualErr).toBeNull();
        expect(actualResult).toEqual(bridges);
    });

    it('parallel get URLs', function() {
        var actualErr, actualResult;

        AjaxStubRequest('/system/bridges/BRIDGE-0/vlans/VLAN-0', vlan0);
        AjaxStubRequest('/system/bridges/BRIDGE-0/vlans/VLAN-1', vlan1);
        AjaxStubRequest('/system/bridges/BRIDGE-0/vlans/VLAN-2', vlan2);

        RestPipeline.get(vlans.data, function(err, result) {
            actualErr = err;
            actualResult = result;
        });

        expect(actualErr).toBeNull();
        expect(actualResult).toEqual([ vlan0, vlan1, vlan2 ]);
    });

    it('parallel get URLs error', function() {
        var actualErr, actualResult;

        AjaxStubRequest('/system/bridges/BRIDGE-0/vlans/VLAN-0', vlan0);
        AjaxStubRequest('/system/bridges/BRIDGE-0/vlans/VLAN-1', vlan1);
        AjaxStubRequest('/system/bridges/BRIDGE-0/vlans/VLAN-2', 'E2', 500);

        RestPipeline.get(vlans.data, function(err, result) {
            actualErr = err;
            actualResult = result;
        });

        expect(actualErr.response.body).toEqual('E2');
        expect(actualResult).toEqual([ vlan0, vlan1, null ]);
    });

    it('correctly gets bridge response', function() {
        var actualErr, actualResult;

        AjaxStubRequest('/system/bridges', bridges);

        RestPipeline.request([
            { url: '/system/bridges' }
        ], function(err, result) {
            actualErr = err;
            actualResult = result;
        });

        expect(actualErr).toBeNull();
        expect(actualResult).toEqual(bridges);
    });

    it('correctly gets VLAN response', function() {
        var actualErr, actualResult;

        AjaxStubRequest('/system/bridges/BRIDGE-0/vlans', vlans);

        RestPipeline.request([
            { url: '/system/bridges/BRIDGE-0/vlans' }
        ], function(err, result) {
            actualErr = err;
            actualResult = result;
        });

        expect(actualErr).toBeNull();
        expect(actualResult).toEqual(vlans);
    });

    it('correctly gets VLAN URLs', function() {
        var actualErr, actualResult;

        AjaxStubRequest('/system/bridges/BRIDGE-0/vlans', vlans);

        RestPipeline.request([
            { url: '/system/bridges/BRIDGE-0/vlans', filter: 'data' }
        ], function(err, result) {
            actualErr = err;
            actualResult = result;
        });

        expect(actualErr).toBeNull();
        expect(actualResult).toEqual(vlans.data);
    });

    it('correctly gets VLAN data', function() {
        var actualErr, actualResult;

        AjaxStubRequest('/system/bridges/BRIDGE-0/vlans', vlans);
        AjaxStubRequest('/system/bridges/BRIDGE-0/vlans/VLAN-0', vlan0);
        AjaxStubRequest('/system/bridges/BRIDGE-0/vlans/VLAN-1', vlan1);
        AjaxStubRequest('/system/bridges/BRIDGE-0/vlans/VLAN-2', vlan2);

        RestPipeline.request([
            { url: '/system/bridges/BRIDGE-0/vlans', filter: 'data' },
            { }
        ], function(err, result) {
            actualErr = err;
            actualResult = result;
        });

        expect(actualErr).toBeNull();
        expect(actualResult).toEqual([ vlan0, vlan1, vlan2 ]);
    });

    it('correctly gets VLAN data names', function() {
        var actualErr, actualResult;

        AjaxStubRequest('/system/bridges/BRIDGE-0/vlans', vlans);
        AjaxStubRequest('/system/bridges/BRIDGE-0/vlans/VLAN-0', vlan0);
        AjaxStubRequest('/system/bridges/BRIDGE-0/vlans/VLAN-1', vlan1);
        AjaxStubRequest('/system/bridges/BRIDGE-0/vlans/VLAN-2', vlan2);

        RestPipeline.request([
            { url: '/system/bridges/BRIDGE-0/vlans', filter: 'data' },
            { filter: 'name' }
        ], function(err, result) {
            actualErr = err;
            actualResult = result;
        });

        expect(actualErr).toBeNull();
        expect(actualResult).toEqual([ vlan0.name, vlan1.name, vlan2.name ]);
    });

    it('correctly gets port data names', function() {
        var actualErr, actualResult;

        AjaxStubRequest('/system/bridges/BRIDGE-0/ports', ports);
        AjaxStubRequest('/system/bridges/BRIDGE-0/ports/PORT-0', port0);
        AjaxStubRequest('/system/bridges/BRIDGE-0/ports/PORT-1', port1);

        RestPipeline.request([
            { url: '/system/bridges/BRIDGE-0/ports', filter: 'data' },
            { filter: 'name' }
        ], function(err, result) {
            actualErr = err;
            actualResult = result;
        });

        expect(actualErr).toBeNull();
        expect(actualResult).toEqual([ port0.name, port1.name ]);
    });

    it('correctly gets interfaces URLs', function() {
        var actualErr, actualResult;

        AjaxStubRequest('/system/interfaces', infs);

        RestPipeline.request([
            { url: '/system/interfaces', filter: 'data' }
        ], function(err, result) {
            actualErr = err;
            actualResult = result;
        });

        expect(actualErr).toBeNull();
        expect(actualResult).toEqual(infs.data);
    });

    it('correctly gets interfaces data', function() {
        var actualErr, actualResult;

        AjaxStubRequest('/system/interfaces', infs);
        AjaxStubRequest('/system/interfaces/INF-0', inf0);
        AjaxStubRequest('/system/interfaces/INF-1', inf1);
        AjaxStubRequest('/system/interfaces/INF-2', inf2);

        RestPipeline.request([
            { url: '/system/interfaces', filter: 'data' },
            { }
        ], function(err, result) {
            actualErr = err;
            actualResult = result;
        });

        expect(actualErr).toBeNull();
        expect(actualResult).toEqual([ inf0, inf1, inf2 ]);
    });

    it('correctly gets interfaces data names', function() {
        var actualErr, actualResult;

        AjaxStubRequest('/system/interfaces', infs);
        AjaxStubRequest('/system/interfaces/INF-0', inf0);
        AjaxStubRequest('/system/interfaces/INF-1', inf1);
        AjaxStubRequest('/system/interfaces/INF-2', inf2);

        RestPipeline.request([
            { url: '/system/interfaces', filter: 'data' },
            { filter: 'name' }
        ], function(err, result) {
            actualErr = err;
            actualResult = result;
        });

        expect(actualErr).toBeNull();
        expect(actualResult).toEqual([ inf0.name, inf1.name, inf2.name ]);
    });

    it('correctly gets bridge then VLAN data', function() {
        var actualErr, actualResult;

        AjaxStubRequest('/system/bridges', bridges);
        AjaxStubRequest('/system/bridges/BRIDGE-0/vlans', vlans);
        AjaxStubRequest('/system/bridges/BRIDGE-0/vlans/VLAN-0', vlan0);
        AjaxStubRequest('/system/bridges/BRIDGE-0/vlans/VLAN-1', vlan1);
        AjaxStubRequest('/system/bridges/BRIDGE-0/vlans/VLAN-2', vlan2);

        RestPipeline.request([
            { url: '/system/bridges', filter: 'data.0' },
            { append: 'vlans', filter: 'data' },
            { }
        ], function(err, result) {
            actualErr = err;
            actualResult = result;
        });

        expect(actualErr).toBeNull();
        expect(actualResult).toEqual([ vlan0, vlan1, vlan2 ]);
    });

});
