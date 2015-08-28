/*
 * Test Store.
 * @author Kelsey Dedoshka
 */

describe('Test Suite For PortsMonitorStore', function() {

    var PortsMonitorStore;

    beforeEach(function() {
        PortsMonitorStore = require('PortsMonitorStore');
    });


    it('correct initial state of the store', function() {
        expect(PortsMonitorStore.state.portStats).toEqual({
            previous: null,
            current: null
        });
        expect(PortsMonitorStore.state.portList).toEqual([]);
        expect(PortsMonitorStore.state.selectedPort).toBeNull();
        expect(PortsMonitorStore.state.interval).toBeNull();
        expect(PortsMonitorStore.state.initialLoad).toBe(1);
        expect(PortsMonitorStore.state.chartType).toBe('line');
        expect(PortsMonitorStore.state.activeDetails).toBeNull();
        expect(PortsMonitorStore.state.pointCount).toBe(0);
        expect(PortsMonitorStore.state.secondsCount).toBe(0);
        expect(PortsMonitorStore.state.pauseHandler).toBe(true);
        expect(PortsMonitorStore.state.playHandler).toBe(false);
        expect(PortsMonitorStore.state.labels).toEqual([]);
        expect(PortsMonitorStore.state.dataSets).toEqual({});
        expect(PortsMonitorStore.state.options).toEqual({
            animation: false,
            responsive: true,
            scaleBeginAtZero: true,
            maintainAspectRatio: false,
            scaleLabel: '<%=value + "%"%>'
        });
    });

    it('correct state of dataSets on loadGraphs - half and full duplex', function() {

        //full duplex
        PortsMonitorStore.loadGraphs('full');
        expect(PortsMonitorStore.state.dataSets.rxData).toBeDefined();
        expect(PortsMonitorStore.state.dataSets.txData).toBeDefined();
        expect(PortsMonitorStore.state.dataSets.errorData).toBeDefined();
        expect(PortsMonitorStore.state.dataSets.droppedData).toBeDefined();

        //half duplex
        PortsMonitorStore.loadGraphs('half');
        expect(PortsMonitorStore.state.dataSets.halfData).toBeDefined();
        expect(PortsMonitorStore.state.dataSets.errorData).toBeDefined();
        expect(PortsMonitorStore.state.dataSets.droppedData).toBeDefined();

    });

    it('correct state of graph show var when toggling display', function() {
        PortsMonitorStore.loadGraphs('full');

        //toggle rx off then on
        PortsMonitorStore.onToggleGraphDisplay('rxData');
        expect(PortsMonitorStore.state.dataSets.rxData.options.show).toBe(0);
        PortsMonitorStore.onToggleGraphDisplay('rxData');
        expect(PortsMonitorStore.state.dataSets.rxData.options.show).toBe(1);

        //toggle error off then tx off then tx on then error on
        PortsMonitorStore.onToggleGraphDisplay('errorData');
        expect(PortsMonitorStore.state.dataSets.errorData.options.show).toBe(0);
        PortsMonitorStore.onToggleGraphDisplay('txData');
        expect(PortsMonitorStore.state.dataSets.txData.options.show).toBe(0);
        PortsMonitorStore.onToggleGraphDisplay('txData');
        expect(PortsMonitorStore.state.dataSets.txData.options.show).toBe(1);
        PortsMonitorStore.onToggleGraphDisplay('errorData');
        expect(PortsMonitorStore.state.dataSets.errorData.options.show).toBe(1);

    });

    it('correct state of chart type and active details', function() {
        PortsMonitorStore.loadGraphs('full');

        //switch from line to bar
        PortsMonitorStore.onSetActiveDetails('rxData');
        expect(PortsMonitorStore.state.chartType).toBe('bar');
        expect(PortsMonitorStore.state.activeDetails).toBe('rxData');

        //switch from bar to bar
        PortsMonitorStore.onSetActiveDetails('txData');
        expect(PortsMonitorStore.state.chartType).toBe('bar');
        expect(PortsMonitorStore.state.activeDetails).toBe('txData');

        //switch from bar to line
        PortsMonitorStore.onSetActiveDetails('txData');
        expect(PortsMonitorStore.state.chartType).toBe('line');
        expect(PortsMonitorStore.state.activeDetails).toBe(null);

    });
});
