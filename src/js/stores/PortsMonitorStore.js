/*
 * Data Store for the ports monitor view
 * @author Kelsey Dedoshka
 */

var Reflux = require('reflux'),
    PortsMonitorActions = require('PortsMonitorActions'),
    _ = require('lodash'),
    Chart = require('chart.js/Chart'),
    Calcs = require('calculations'),
    MAX_POINTS_ON_GRAPH = 25,
    STATS_LOW_START = 0,
    STATS_LOW_END = 40,
    STATS_MED_END = 90,
    INTERVAL = 5000;

/***** Class Constructors for graph data objects *******/

//DataSets contains all data for a line graph object
function DataSet(title, index, options, allData, stats, graphData) {
    this.title = title;
    this.index = index;
    this.options = options;
    this.allData = allData;
    this.stats = stats;
    this.graphData = graphData;
}

//Stats contains all data for a stats object in
//a DataSet
function Stats() {
    this.numDataPoints = 0;
    this.high = 0;
    this.med = 0;
    this.low = 0;
    this.average = 0.00;
}

//FIXME - default selectedPort: 1 needs to be null until they
//select -might not be active

/******* Begin Store ********/

module.exports = Reflux.createStore({

    listenables: [ PortsMonitorActions ],

    // Data model port graph data, colors, and graph config
    state: {
        //keeps 2 data points to calculate utilization
        portStats: { previous: null, current: null },

        //list of ports on the device to display for selection
        portList: [],

        //current selected port
        selectedPort: null,

        //database query interval reference
        interval: null,

        //number of points on the graph
        pointCount: 0,

        //seconds on the graph for x axis -- FIXME - this needs to
        //updatge by the interval time not 1
        secondsCount: 0,

        //keep track of onclick handler for the pause button
        pauseHandler: true,

        //keep track of onclick handler for the play button
        playHandler: false,

        //graph colors - stroke: line stroke
        //fill: fill under graph
        //light: to make transprent when showing details
        colors: [
                { 'stroke': 'rgba(0,120,4,1)',
                    'fill': 'rgba(0,120,4,0.3)',
                    'light': 'rgba(0,120,4,0.1)' },
                { 'stroke': 'rgba(0,88,105,1)',
                    'fill': 'rgba(0,88,105,0.3)',
                    'light': 'rgba(0,88,105,0.1)' },
                { 'stroke': 'rgba(139,178,0,1)',
                    'fill': 'rgba(139,178,0,0.3)',
                    'light': 'rgba(139,178,0,0.1)' },
                { 'stroke': 'rgba(60,43,69, 1)',
                    'fill': 'rgba(60,43,69,0.3)',
                    'light': 'rgba(60,43,69,0.1)' }
            ],

        //datasets for the utilization chart
        //each data set is a line on the graph
        dataSets: {
            rxData: {},
            txData: {},
            errorData: {},
            droppedData: {}
        },

        //line chart options
        options: {
            animation: false,
            responsive: true,
            scaleBeginAtZero: true,
            maintainAspectRatio: false,
            scaleLabel: "<%=value + '%'%>"
        },

        //chart context reference
        chart: null
    },

    // initialize the store.
    getInitialState: function() {
        //initialize the graph objects
        this.loadGraphs();
        return this.state;
    },

    //create the graph objects
    loadGraphs: function() {

        // the default graph types to initizalie the data sets
        var graphTypes = [
            { 'name': 'rxData', 'title': 'rx utilization' },
            { 'name': 'txData', 'title': 'tx utilization' },
            { 'name': 'droppedData', 'title': 'dropped utilization' },
            { 'name': 'errorData', 'title': 'error utilization' }
        ];

        for (var i=0; i<graphTypes.length; i++) {
            var initialStats = new Stats();

            var data = new DataSet(
                graphTypes[i].name, i, { 'show': 1, 'colorIndex': i }, [],
                initialStats,
                { 'label': graphTypes[i].title,
                    fillColor: this.state.colors[i].fill,
                    strokeColor: this.state.colors[i].stroke,
                    pointColor: this.state.colors[i].stroke
                }
            );

            this.state.dataSets[graphTypes[i].name] = data;
        }
    },

     // Callback for success of loading port stats data
    onLoadPortStatsCompleted: function(portStats) {

        var dataArray = [];
        var updateSeconds = 0;

        //Parse return data
        var linkSpeed = portStats.data.link_speed;
        var stats = portStats.data.statistics;
        var duplex = portStats.data.duplex;

        //Update port counters and data points
        this.state.portStats.previous = _.cloneDeep(this.state.portStats.current);
        this.state.portStats.current = stats;
        this.updatePointCount();

        for (var key in this.state.dataSets) {
            if (this.state.dataSets.hasOwnProperty(key)) {

                var line = this.state.dataSets[key];

                //calculate utilization based on link speed and data points
                var num = this.calculateUtilization(duplex, linkSpeed, key);
                //var num = Math.floor(Math.random() * 100) + 0;

                if (line.options.show) {
                    if (num !== null) {
                        line.allData.push(num);
                        dataArray.push(num);

                        this.updatePortStats(line, num);
                        this.updateAverage(line);
                        updateSeconds = 1;
                    }
                } else {
                    dataArray.push(null);
                    updateSeconds = 1;
                }
            }
        }

        //update x axis seconds and add data to live chart
        if (updateSeconds) {
            this.state.chart.addData(dataArray, this.state.secondsCount);
            this.state.secondsCount = this.state.secondsCount + 5;
        }

        this.trigger(this.state);
    },

    //Callback for success of loading port list from server
    onLoadPortsCompleted: function(ports) {
        var list = [];
        for (var i in ports) {
            if (ports.hasOwnProperty(i)) {
                var port = ports[i].data;
                if (port.link_state[0] === 'up' && port.link_speed[0] > 0) {
                    list.push(Number(port.name));
                }
            }
        }

        this.state.portList = list.sort(function(a, b) { return a-b; });
        this.state.selectedPort = this.state.portList[0];

        // start the initial interval when the ports return
        var interval = setInterval(PortsMonitorActions
            .loadPortStats.bind(this, this.state.selectedPort), INTERVAL);
        this.state.interval = interval;
        this.trigger(this.state);
    },

    //handler to set the state of the chart context
    onSetChartContext: function(id) {
        var graphData = {
            'labels': [],
            'datasets': [
                this.state.dataSets.rxData.graphData,
                this.state.dataSets.txData.graphData,
                this.state.dataSets.errorData.graphData,
                this.state.dataSets.droppedData.graphData
            ]
        };

        var ctx = document.getElementById(id).getContext('2d');
        var chart = new Chart(ctx).Line(graphData, this.state.options);

        this.state.chart = chart;
        this.trigger(this.state);
    },

    //handler to toggle the graph display
    onToggleGraphDisplay: function(key) {
        this.state.dataSets[key].options.show =
            !(this.state.dataSets[key].options.show);
        this.trigger(this.state);
    },

    //handler to reset the graph
    onResetGraph: function() {
        this.resetGraph();
    },

    //handler for user selected port in dropdown list
    onSetPortSelected: function(port) {
        clearInterval(this.state.interval);
        this.state.selectedPort = port;
        this.clearStats();
        this.resetGraph();
        this.onSetChartContext('portStatsChart');
        this.trigger(this.state);
    },

    //handler to set the interval reference in the store
    onSetInterval: function(interval) {
        this.state.interval = interval;
        this.trigger(this.state);
    },

    //handler to set the name of the selected details to show
    onSetActiveDetails: function(name) {
        this.state.activeGraph = name;
        this.trigger(this.state);
    },

    /*************** helper functions *****************/
    //clear the chart stats for each graph
    clearStats: function() {
        for (var key in this.state.dataSets) {
            if (this.state.dataSets.hasOwnProperty(key)) {
                var data = this.state.dataSets[key];
                data.stats.average = 0;
                data.stats.low = 0;
                data.stats.med = 0;
                data.stats.high = 0;
            }
        }
    },

    //reset the graph and canvas
    resetGraph: function() {
        //reset the counters
        this.state.pointCount = 0;
        this.state.secondsCount = 0;
        this.state.playHandler = false;
        this.state.pauseHandler = true;

        //destroy current chart instance
        this.state.chart.destroy();
        this.trigger(this.state);
    },

    //track the point count - keep limit of number of points
    //that can show on the graph at once
    updatePointCount: function() {
        var pointCount = this.state.pointCount;
        if (pointCount === MAX_POINTS_ON_GRAPH) {
            this.state.chart.removeData();
            //this.state.chart.allGraphData.shift();
            //this.state.barChart.removeData();
        } else {
            this.state.pointCount = this.state.pointCount + 1;
        }

    },

    //calculate data average and update store
    updateAverage: function(index) {
        var sum = 0;
        for (var i=0; i<index.allData.length; i++) {
            if (index.allData[i] !== null) {
                sum += Number(index.allData[i]);
            }
        }

        if (index.allData.length > 0) {
            index.stats.average = (sum / index.allData.length).toFixed(2);
        }
    },

    //update port stats for low, med, high
    updatePortStats: function(item, num) {
        item.stats.numData++;
        if (num >= STATS_LOW_START && num <= STATS_LOW_END) {
            item.stats.low++;
        } else if (num > STATS_LOW_END && num < STATS_MED_END) {
            item.stats.med++;
        } else if (num >= STATS_MED_END) {
            item.stats.high++;
        }
    },

    // pause play handler for graph
    onSetPausePlayHandler: function(action, handler) {
        if (action === 'play') {
            this.state.playHandler = handler;
        } else if (action === 'pause') {
            this.state.pauseHandler = handler;
        }
        this.trigger(this.state);
    },

    // calculate utilization for full duplex
    calculateFullDuplex: function(linkSpeed, key, stats) {
        var util, curr, prev;
        switch (key) {
            case 'rxData':
                curr = stats.current ? Number(stats.current.rx_bytes) : null;
                prev = stats.previous ? Number(stats.previous.rx_bytes) : null;
                break;
            case 'txData':
                curr = stats.current ? Number(stats.current.tx_bytes) : null;
                prev = stats.previous ? Number(stats.previous.tx_bytes) : null;
                break;
            case 'droppedData':
                curr = stats.current ? Number(stats.current.rx_dropped)
                    + Number(stats.current.tx_dropped) : null;
                prev = stats.previous ? Number(stats.previous.rx_dropped)
                    + Number(stats.previous.tx_dropped) : null;
                break;
            case 'errorData':
                curr = stats.current ? Number(stats.current.rx_errors)
                    + Number(stats.current.tx_errors) : null;
                prev = stats.previous ? Number(stats.previous.rx_errors)
                    + Number(stats.previous.tx_errors) : null;
                break;
        }

        util = (Calcs.calcFullUtil(prev, curr, linkSpeed)).toFixed(2);
        return Number(util);
    },

    //calcualte port utilization
    calculateUtilization: function(duplex, linkSpeed, key) {
        var stats = this.state.portStats;
        var util;

        //FIXME - are there ever more than 1 items in the array?
        if (duplex[0] === 'full') {
            util = this.calculateFullDuplex(linkSpeed, key, stats);
        }

        return util;
    }
});
