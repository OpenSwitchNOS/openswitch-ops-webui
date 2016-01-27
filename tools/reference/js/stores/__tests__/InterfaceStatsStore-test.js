/*
 * Test Store.
 * @author Frank Wood
 */

describe('Test Suite For InterfaceStatsStore', function() {

    var InterfaceStatsStore,
        InterfaceActions,
        Lodash,
        DATA1 = [                       // inf0 is down, inf1 is up
            {
                link: 'down',
                duplex: 'full',
                speed: 1000000000,
                name: 'inf0',
                rxBytes: 100,
                txBytes: 200
            }, {
                link: 'up',
                duplex: 'full',
                speed: 1000000000,
                name: 'inf1',
                rxBytes: 100,
                txBytes: 1000
            }
        ],
        DATA2 = [                       // inf0 is up, inf1 is up
            {
                link: 'up',
                duplex: 'full',
                speed: 1000000000,
                name: 'inf0',
                rxBytes: 100,
                txBytes: 200
            }, {
                link: 'up',
                duplex: 'full',
                speed: 1000000000,
                name: 'inf1',
                rxBytes: 125000100,     // 100% utilization from DATA1
                txBytes: 12501000       // 10% utilization from DATA1
            }
        ],
        DATA3 = [                       // inf0 is up, inf1 is down
            {
                link: 'up',
                duplex: 'full',
                speed: 1000000000,
                name: 'inf0',
                rxBytes: 62500100,      // 50% utilization from DATA2
                txBytes: 200            // 0% utilization from DATA2
            }, {
                link: 'down',
                duplex: 'full',
                speed: 1000000000,
                name: 'inf1',
                rxBytes: 125000100,
                txBytes: 12501000
            }
        ],
        DATA4 = [                       // inf0, inf1, inf2 are up
            {
                link: 'up',
                duplex: 'full',
                speed: 1000000000,
                name: 'inf0',
                rxBytes: 62500100,      // 0% utilization from DATA3
                txBytes: 200            // 0% utilization from DATA3
            }, {
                link: 'up',
                duplex: 'full',
                speed: 1000000000,
                name: 'inf1',
                rxBytes: 125000100,     // 0% utilization from DATA3
                txBytes: 12501000       // 0% utilization from DATA3
            },
            {
                link: 'up',
                duplex: 'half',
                speed: 1000000000,
                name: 'inf2',
                rxBytes: 1000,
                txBytes: 10000
            },
            {
                link: 'up',
                duplex: 'half',
                speed: 100000000,        // 100Mb
                name: 'inf3',
                rxBytes: 0,
                txBytes: 0
            }
        ],
        DATA5 = [                       // inf0, inf1, inf2 are up
            {
                link: 'up',
                duplex: 'full',
                speed: 1000000000,
                name: 'inf0',
                rxBytes: 65000100,      // 2% utilization from DATA4
                txBytes: 50000200       // 40% utilization from DATA4
            }, {
                link: 'up',
                duplex: 'full',
                speed: 1000000000,
                name: 'inf1',
                rxBytes: 125000100,     // 0% utilization from DATA4
                txBytes: 87501000       // 60% utilization from DATA4
            },
            {
                link: 'up',
                duplex: 'half',
                speed: 1000000000,
                name: 'inf2',
                rxBytes: 75001000,      // 60% + 20% utilization from DATA4
                txBytes: 25010000
            },
            {
                link: 'up',
                duplex: 'half',
                speed: 100000000,        // 100Mb
                name: 'inf3',
                rxBytes: 2500000,        // 20% + 10% utilization from DATA4
                txBytes: 1250000
            }
        ];

    beforeEach(function() {
        InterfaceStatsStore = require('InterfaceStatsStore');
        InterfaceActions = require('InterfaceActions');
        Lodash = require('lodash');
    });

    it('correct initial settings', function() {
        var issState = InterfaceStatsStore.state;
        expect(issState.timestampMillis).toBe(0);
        expect(issState.interfaces).toEqual({});
        expect(issState.topUtilization).toEqual([]);
    });

    it('works for the first stat update', function() {
        var issState = InterfaceStatsStore.state;

        spyOn(InterfaceStatsStore, 'trigger');

        InterfaceActions.load.completed(DATA1);

        jasmine.clock().tick(); // allow action

        expect(issState.timestampMillis).toBeGreaterThan(0);
        expect(issState.topUtilization).toEqual([]);
        expect(issState.interfaces).toEqual({ inf1: DATA1[1] });

        expect(InterfaceStatsStore.trigger.calls.count()).toEqual(1);
    });

    it('works for 2 stat updates', function() {
        var infCopy,
            baseTime,
            issState = InterfaceStatsStore.state;

        expect(issState.timestampMillis).toBe(0);
        expect(issState.interfaces).toEqual({});
        expect(issState.topUtilization).toEqual([]);

        spyOn(InterfaceStatsStore, 'trigger');

        baseTime = new Date(1000);
        jasmine.clock().mockDate(baseTime);

        InterfaceActions.load.completed(DATA1);
        jasmine.clock().tick();

        InterfaceActions.load.completed(DATA2);
        jasmine.clock().tick(1000); // 1 second
        expect(new Date().getTime()).toEqual(baseTime.getTime() + 1000);

        expect(issState.timestampMillis).toBeGreaterThan(0);
        expect(issState.topUtilization.length).toEqual(2);

        infCopy = Lodash.cloneDeep(DATA2[1]);
        infCopy.rxUtl = 100;
        infCopy.txUtl = 10;

        expect(issState.interfaces).toEqual({ inf0: DATA2[0], inf1: infCopy });

        expect(issState.topUtilization).toEqual([
            { ci: infCopy, utl: 100, dir: 'rx' },
            { ci: infCopy, utl: 10, dir: 'tx' }
        ]);

        expect(InterfaceStatsStore.trigger.calls.count()).toEqual(2);
    });

    it('works for 3 stat updates', function() {
        var infCopy,
            baseTime,
            issState = InterfaceStatsStore.state;

        spyOn(InterfaceStatsStore, 'trigger');

        baseTime = new Date(1000);
        jasmine.clock().mockDate(baseTime);

        InterfaceActions.load.completed(DATA1);
        jasmine.clock().tick();

        InterfaceActions.load.completed(DATA2);
        jasmine.clock().tick(1000); // 1 second
        expect(new Date().getTime()).toEqual(baseTime.getTime() + 1000);

        InterfaceActions.load.completed(DATA3);
        jasmine.clock().tick(1000); // 1 second
        expect(new Date().getTime()).toEqual(baseTime.getTime() + 2000);

        expect(issState.timestampMillis).toBeGreaterThan(0);
        expect(issState.topUtilization.length).toEqual(2);

        infCopy = Lodash.cloneDeep(DATA3[0]);
        infCopy.rxUtl = 50;
        infCopy.txUtl = 0;

        expect(issState.interfaces).toEqual({ inf0: infCopy });
        expect(issState.topUtilization).toEqual([
            { ci: infCopy, utl: 50, dir: 'rx' },
            { ci: infCopy, utl: 0, dir: 'tx' }
        ]);

        expect(InterfaceStatsStore.trigger.calls.count()).toEqual(3);
    });

    it('multi updates, half duplex, sort & truncing top utl', function() {
        var infCopy0, infCopy1, infCopy2, infCopy3,
            baseTime,
            issState = InterfaceStatsStore.state;

        spyOn(InterfaceStatsStore, 'trigger');

        baseTime = new Date(1000);
        jasmine.clock().mockDate(baseTime);

        InterfaceActions.load.completed(DATA1);
        jasmine.clock().tick();

        InterfaceActions.load.completed(DATA2);
        jasmine.clock().tick(1000); // 1 second
        expect(new Date().getTime()).toEqual(baseTime.getTime() + 1000);

        InterfaceActions.load.completed(DATA3);
        jasmine.clock().tick(1000); // 1 second
        expect(new Date().getTime()).toEqual(baseTime.getTime() + 2000);

        InterfaceActions.load.completed(DATA4);
        jasmine.clock().tick(1000); // 1 second
        expect(new Date().getTime()).toEqual(baseTime.getTime() + 3000);

        InterfaceActions.load.completed(DATA5);
        jasmine.clock().tick(1000); // 1 second
        expect(new Date().getTime()).toEqual(baseTime.getTime() + 4000);

        expect(issState.timestampMillis).toBeGreaterThan(0);
        expect(Object.keys(issState.interfaces).length).toEqual(4);
        expect(issState.topUtilization.length).toEqual(6);

        infCopy0 = Lodash.cloneDeep(DATA5[0]);
        infCopy0.rxUtl = 2;
        infCopy0.txUtl = 40;

        infCopy1 = Lodash.cloneDeep(DATA5[1]);
        infCopy1.rxUtl = 0;
        infCopy1.txUtl = 60;

        infCopy2 = Lodash.cloneDeep(DATA5[2]);
        infCopy2.rxUtl = infCopy2.txUtl = 80;

        infCopy3 = Lodash.cloneDeep(DATA5[3]);
        infCopy3.rxUtl = infCopy3.txUtl = 30;

        expect(issState.topUtilization[0]).toEqual(
            { ci: infCopy2, utl: 80, dir: 'txRx' }
        );
        expect(issState.topUtilization[1]).toEqual(
            { ci: infCopy1, utl: 60, dir: 'tx' }
        );
        expect(issState.topUtilization[2]).toEqual(
            { ci: infCopy0, utl: 40, dir: 'tx' }
        );
        expect(issState.topUtilization[3]).toEqual(
            { ci: infCopy3, utl: 30, dir: 'txRx' }
        );
        expect(issState.topUtilization[4]).toEqual(
            { ci: infCopy0, utl: 2, dir: 'rx' }
        );

        expect(InterfaceStatsStore.trigger.calls.count()).toEqual(5);
    });

    it('handles duplex changes', function() {
        var inf, infCopy,
            baseTime,
            issState = InterfaceStatsStore.state;

        baseTime = new Date(1000);
        jasmine.clock().mockDate(baseTime);

        inf = {
            link: 'up',
            duplex: 'half',
            speed: 100000000, // 100Gb
            name: 'inf0',
            rxBytes: 0,
            txBytes: 0
        };

        InterfaceActions.load.completed([ inf ]);
        jasmine.clock().tick();

        inf.txBytes = 1500000;

        InterfaceActions.load.completed([ inf ]);
        jasmine.clock().tick(1000); // 1 second

        expect(Object.keys(issState.interfaces).length).toEqual(1);
        expect(issState.topUtilization.length).toEqual(1);

        infCopy = Lodash.cloneDeep(inf);
        infCopy.rxUtl = 12;
        infCopy.txUtl = 12;

        expect(issState.topUtilization[0]).toEqual(
            { ci: infCopy, utl: 12, dir: 'txRx' }
        );

        inf.duplex = 'full';
        inf.txBytes = 3000000;

        InterfaceActions.load.completed([ inf ]);
        jasmine.clock().tick(1000); // 1 second

        expect(Object.keys(issState.interfaces).length).toEqual(1);
        expect(issState.topUtilization.length).toEqual(0);

        inf.rxBytes = 6000000;
        inf.txBytes = 3750000;

        InterfaceActions.load.completed([ inf ]);
        jasmine.clock().tick(1000); // 1 second

        infCopy = Lodash.cloneDeep(inf);
        infCopy.rxUtl = 48;
        infCopy.txUtl = 6;

        expect(Object.keys(issState.interfaces).length).toEqual(1);
        expect(issState.topUtilization.length).toEqual(2);

        expect(issState.topUtilization[0]).toEqual(
            { ci: infCopy, utl: 48, dir: 'rx' }
        );
        expect(issState.topUtilization[1]).toEqual(
            { ci: infCopy, utl: 6, dir: 'tx' }
        );
    });

    it('handles speed changes & 10 second interval', function() {
        var inf, infCopy,
            baseTime,
            issState = InterfaceStatsStore.state;

        baseTime = new Date(1000);
        jasmine.clock().mockDate(baseTime);

        inf = {
            link: 'up',
            duplex: 'full',
            speed: 100000000, // 100Gb
            name: 'inf0',
            rxBytes: 0,
            txBytes: 0
        };

        InterfaceActions.load.completed([ inf ]);
        jasmine.clock().tick();

        inf.txBytes = 1500000;

        InterfaceActions.load.completed([ inf ]);
        jasmine.clock().tick(10000); // 10 second

        expect(Object.keys(issState.interfaces).length).toEqual(1);
        expect(issState.topUtilization.length).toEqual(2);

        infCopy = Lodash.cloneDeep(inf);
        infCopy.rxUtl = 0;
        infCopy.txUtl = 1.2;

        expect(issState.topUtilization).toEqual([
            { ci: infCopy, utl: 1.2, dir: 'tx' },
            { ci: infCopy, utl: 0, dir: 'rx' }
        ]);

        inf.speed = 1000000000;
        inf.txBytes = 3000000;

        InterfaceActions.load.completed([ inf ]);
        jasmine.clock().tick(10000); // 10 second

        expect(Object.keys(issState.interfaces).length).toEqual(1);
        expect(issState.topUtilization.length).toEqual(0);

        inf.txBytes = 4500000;

        InterfaceActions.load.completed([ inf ]);
        jasmine.clock().tick(10000); // 10 second

        infCopy = Lodash.cloneDeep(inf);
        infCopy.rxUtl = 0;
        infCopy.txUtl = 0.12;

        expect(Object.keys(issState.interfaces).length).toEqual(1);
        expect(issState.topUtilization.length).toEqual(2);

        expect(issState.topUtilization).toEqual([
            { ci: infCopy, utl: 0.12, dir: 'tx' },
            { ci: infCopy, utl: 0, dir: 'rx' }
        ]);
    });

});
