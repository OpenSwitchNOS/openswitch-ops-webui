/*
 * Test.
 * @author Frank Wood
 */

describe('Test Suite For restUtils', function() {

    var bridges = {
            testUrl: '/system/bridges',
            data: [
                '/system/bridges/BRIDGE-0'
            ]
        },
        vlans = {
            testUrl: '/system/bridges/BRIDGE-0/vlans',
            data: [
                '/system/bridges/BRIDGE-0/vlans/VLAN-0',
                '/system/bridges/BRIDGE-0/vlans/VLAN-1',
                '/system/bridges/BRIDGE-0/vlans/VLAN-2'
            ]
        },
        vlan0 = {
            testUrl: '/system/bridges/BRIDGE-0/vlans/VLAN-0',
            name: 'vlan0'
        },
        vlan1 = {
            testUrl: '/system/bridges/BRIDGE-0/vlans/VLAN-1',
            name: 'vlan1'
        },
        vlan2 = {
            testUrl: '/system/bridges/BRIDGE-0/vlans/VLAN-2',
            name: 'vlan2'
        },
        ports = {
            testUrl: '/system/bridges/BRIDGE-0/ports',
            data: [
                '/system/bridges/BRIDGE-0/ports/PORT-0',
                '/system/bridges/BRIDGE-0/ports/PORT-1'
            ]
        },
        port0 = {
            testUrl: '/system/bridges/BRIDGE-0/ports/PORT-0',
            name: 'port0'
        },
        port1 = {
            testUrl: '/system/bridges/BRIDGE-0/ports/PORT-1',
            name: 'port1'
        },
        infs = {
            testUrl: '/system/interfaces',
            data: [
                '/system/interfaces/INF-0',
                '/system/interfaces/INF-1',
                '/system/interfaces/INF-2'
            ]
        },
        inf0 = {
            testUrl: '/system/interfaces/INF-0',
            name: 'inf0'
        },
        inf1 = {
            testUrl: '/system/interfaces/INF-1',
            name: 'inf1'
        },
        inf2 = {
            testUrl: '/system/interfaces/INF-2',
            name: 'inf2'
        },
        RestUtils;

    beforeEach(function() {
        RestUtils = require('restUtils');
    });

    it('get single URL', function() {
        var err, result;

        AjaxStubRequest(bridges.testUrl, bridges);

        RestUtils.get(bridges.testUrl, function(e, r) {
            err = e;
            result = r;
        });

        expect(err).toBeNull();
        expect(result).toEqual(bridges);
    });

    it('get single URL with error', function() {
        var err, result;

        AjaxStubRequest(bridges.testUrl, 'E0', 500);

        RestUtils.get(bridges.testUrl, function(e, r) {
            err = e;
            result = r;
        });

        expect(result).toBeNull();
        expect(err.response.body).toEqual('E0');
    });

    it('get URL array in parallel', function() {
        var err, result;

        AjaxStubRequest(vlan0.testUrl, vlan0);
        AjaxStubRequest(vlan1.testUrl, vlan1);
        AjaxStubRequest(vlan2.testUrl, vlan2);

        RestUtils.get(vlans.data, function(e, r) {
            err = e;
            result = r;
        });

        expect(err).toBeNull();
        expect(result).toEqual([ vlan0, vlan1, vlan2 ]);
    });

    it('get URL array in parallel with error', function() {
        var err, result;
        AjaxStubRequest(vlan0.testUrl, vlan0);
        AjaxStubRequest(vlan1.testUrl, 'E1', 500);
        AjaxStubRequest(vlan2.testUrl, vlan2);

        RestUtils.get(vlans.data, function(e, r) {
            err = e;
            result = r;
        });

        expect(result).toEqual([ vlan0, null, vlan2 ]);
        expect(err.response.body).toEqual('E1');
    });

    it('3 passes - single, parallel, parallel', function() {
        var result;

        AjaxStubRequest(bridges.testUrl, bridges);
        AjaxStubRequest(vlans.testUrl, vlans);
        AjaxStubRequest(ports.testUrl, ports);
        AjaxStubRequest(vlan0.testUrl, vlan0);
        AjaxStubRequest(vlan1.testUrl, vlan1);
        AjaxStubRequest(vlan2.testUrl, vlan2);
        AjaxStubRequest(port0.testUrl, port0);
        AjaxStubRequest(port1.testUrl, port1);

        RestUtils.get(bridges.testUrl, function(e1, r1) {
            var baseUrl = r1.data[0];
            expect(e1).toBeNull();
            RestUtils.get([ baseUrl + '/vlans', baseUrl + '/ports' ],
                function(e2, r2) {
                    expect(e2).toBeNull();
                    RestUtils.get([ r2[0].data, r2[1].data ],
                        function(e3, r3) {
                            expect(e3).toBeNull();
                            result = r3;
                        }
                    );
                }
            );
        });

        expect(result).toEqual([
            [ vlan0, vlan1, vlan2 ],
            [ port0, port1 ]
        ]);
    });

    it('3 passes - single, parallel, parallel with error', function() {
        var result;

        AjaxStubRequest(bridges.testUrl, bridges);
        AjaxStubRequest(vlans.testUrl, vlans);
        AjaxStubRequest(ports.testUrl, ports);
        AjaxStubRequest(vlan0.testUrl, 'E0', 500);
        AjaxStubRequest(vlan1.testUrl, vlan1);
        AjaxStubRequest(vlan2.testUrl, vlan2);
        AjaxStubRequest(port0.testUrl, port0);
        AjaxStubRequest(port1.testUrl, 'E1', 500);

        RestUtils.get(bridges.testUrl, function(e1, r1) {
            var baseUrl = r1.data[0];
            expect(e1).toBeNull();
            RestUtils.get([ baseUrl + '/vlans', baseUrl + '/ports' ],
                function(e2, r2) {
                    expect(e2).toBeNull();
                    RestUtils.get([ r2[0].data, r2[1].data ],
                        function(e3, r3) {
                            expect(e3).toBeTruthy();
                            result = r3;
                        }
                    );
                }
            );
        });

        expect(result).toEqual([
            [ null, vlan1, vlan2 ],
            [ port0, null ]
        ]);
    });

    it('differnt base URL array in parallel', function() {
        var result;

        AjaxStubRequest(ports.testUrl, ports);
        AjaxStubRequest(port0.testUrl, port0);
        AjaxStubRequest(port1.testUrl, port1);
        AjaxStubRequest(infs.testUrl, infs);
        AjaxStubRequest(inf0.testUrl, inf0);
        AjaxStubRequest(inf1.testUrl, inf1);
        AjaxStubRequest(inf2.testUrl, inf2);

        RestUtils.get([ ports.testUrl, infs.testUrl ], function(e1, r1) {
            expect(e1).toBeNull();
            RestUtils.get([ r1[0].data, r1[1].data ], function(e2, r2) {
                expect(e2).toBeNull();
                result = r2;
            });
        });

        expect(result).toEqual([
            [ port0, port1 ],
            [ inf0, inf1, inf2 ]
        ]);
    });

});
