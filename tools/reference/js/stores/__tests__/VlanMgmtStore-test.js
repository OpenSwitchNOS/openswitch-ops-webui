/*
 * Test Store.
 * @author Kelsey Dedoshka
 */

describe('Test Suite For VlanMgmtStore', function() {

    var VlanMgmtStore,
        RestUtils;

    var vlans = {
        urlVlans: '/system/bridges/bridge_normal/vlans',
        urlPorts: '/system/bridges/bridge_normal/ports',
        test1: {
            data: [{
                'data': {
                        'name': 'VLAN3',
                        'id': 3,
                        'oper_state': 'up'
                    },
                'ports': [
                        48,
                        'native-untagged'
                    ],
            }],
        }
    };

    var tests = {
        details: {
            test1: 3,
            test2: 25,
            test3: 48
        }
    };

    beforeEach(function() {
        RestUtils = require('restUtils');
        VlanMgmtStore = require('VlanMgmtStore');
    });

    it('correct initial state of the store', function() {
        expect(VlanMgmtStore.state.vlans).toEqual({});
        expect(VlanMgmtStore.state.vlansGraphic).toEqual({});
        expect(VlanMgmtStore.state.vlanDisplay).toEqual({});
        expect(VlanMgmtStore.state.boxPortConfig).toEqual({
            'showVlans': true,
            'data': {}
        });
        expect(VlanMgmtStore.state.colors).toEqual([
            { 'accent': '#FF6F3E', 'main': '#FF9E7D' },
            { 'accent': '#6539A4', 'main': '#9B78CF' },
            { 'accent': '#3B7690', 'main': '#66A8C4' },
            { 'accent': '#D39A42', 'main': '#E3BA7B' }
        ]);
        expect(VlanMgmtStore.state.selectedVlan).toBe(-1);
        expect(VlanMgmtStore.state.numberOfSelectedVlans).toBe(0);
        expect(VlanMgmtStore.state.colorIndexes).toEqual([
            false,
            false,
            false,
            false
        ]);
        expect(VlanMgmtStore.state.portDetails).toEqual({
            show: false,
            port: 0
        });
    });


    it('correct state of show port details', function() {
        VlanMgmtStore.onShowPortDetails(tests.details.test1);
        expect(VlanMgmtStore.state.portDetails.show).toBe(true);
        expect(VlanMgmtStore.state.portDetails.port).toBe(3);

        VlanMgmtStore.onShowPortDetails(tests.details.test2);
        expect(VlanMgmtStore.state.portDetails.show).toBe(true);
        expect(VlanMgmtStore.state.portDetails.port).toBe(25);

        VlanMgmtStore.onShowPortDetails(tests.details.test3);
        expect(VlanMgmtStore.state.portDetails.show).toBe(true);
        expect(VlanMgmtStore.state.portDetails.port).toBe(48);

    });


    it('correct state of close port details', function() {
        VlanMgmtStore.onClosePortDetails();
        expect(VlanMgmtStore.state.portDetails.show).toBe(false);
        expect(VlanMgmtStore.state.portDetails.port).toBe(0);
    });


    it('correct state of loading vlans', function() {
        var err, result;

        // TEST 1
        AjaxStubRequest(vlans.urlVlans, vlans.test1.data);
        AjaxStubRequest(vlans.urlPorts, vlans.test1.data);

        RestUtils.get(vlans.urlPorts, function(e, r) {
            err = e;
            result = r;
        });

        jasmine.clock().tick(); // allow action
        expect(err).toBeNull();
        expect(result.body).toEqual(vlans.test1.data);

    });

});
