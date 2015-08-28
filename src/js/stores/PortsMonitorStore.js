/*
 * Data Store for the ports monitor view
 * @author Kelsey Dedoshka
 */

var Reflux = require('reflux'),
    PortsMonitorActions = require('PortsMonitorActions'),
    _ = require('lodash'),
    Calcs = require('calculations'),
    Cnvs = require('conversions'),
    DateStamp = require('dateStamp'),
    MAX_POINTS_ON_GRAPH = 25,
    INTERVAL = 5000;

/***** Class Constructors for graph data objects *******/

//DataSets contains all data for a line graph object
function DataSet(title, index, options, allData, stats, graphData, desc) {
    this.title = title;
    this.index = index;
    this.options = options;
    this.allData = allData;
    this.stats = stats;
    this.graphData = graphData;
    this.desc = desc;
}

//Stats contains all data for a stats object in
//a DataSet
function Stats() {
    this.high = '';
    this.low = '';
    this.average = 0.00;
    this.total = 0;
}

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

        // track if it is the first load of port stats
        initialLoad: 1,

        //chart type to show - line or bar
        chartType: 'line',

        //set selected bar chart to show
        activeDetails: null,

        //number of points on the graph
        pointCount: 0,

        //seconds on the graph for x axis -- FIXME - this needs to
        //updatge by the interval time not 1
        secondsCount: 0,

        //keep track of onclick handler for the pause button
        pauseHandler: true,

        //keep track of onclick handler for the play button
        playHandler: false,

        //all labels for the graph
        labels: [],

        //graph colors - stroke: line stroke
        //fill: fill under graph
        //light: to make transprent when showing details
        colors: [
                { 'stroke': 'rgba(255,111,62,1)',
                    'fill': 'rgba(255,111,62,0.3)',
                    'light': 'rgba(255,111,62,0.1)' },
                { 'stroke': 'rgba(61,141,155,1)',
                    'fill': 'rgba(61,141,155,0.3)',
                    'light': 'rgba(61,141,155,0.1)' },
                { 'stroke': 'rgba(211,154,66,1)',
                    'fill': 'rgba(211,154,66,0.3)',
                    'light': 'rgba(211,154,66,0.1)' },
                { 'stroke': 'rgba(101,57,164,1)',
                    'fill': 'rgba(101,57,164,0.3)',
                    'light': 'rgba(101,57,164,0.1)' }
            ],

        //datasets for the utilization chart
        //each data set is a line on the graph
        dataSets: {},

        //line chart options
        options: {
            animation: false,
            responsive: true,
            scaleBeginAtZero: true,
            maintainAspectRatio: false,
            scaleLabel: '<%=value + "%"%>'
        },
    },

    // initialize the store.
    getInitialState: function() {
        //initialize the graph objects
        this.loadGraphs();
        return this.state;
    },

    //create the graph objects
    loadGraphs: function(duplex) {

        // reset dataSets before re initializing
        this.state.dataSets = {};

        // the default graph types to initialize the data sets
        var graphTypes;

        // display correct data sets if half or full duplex
        if (duplex === 'half') {
            graphTypes = [
                { 'name': 'halfData', 'title': 'port utilization' },
                { 'name': 'droppedData', 'title': 'Dropped' },
                { 'name': 'errorData', 'title': 'Error' }
            ];
        } else {
            graphTypes = [
                { 'name': 'rxData', 'title': 'Rx utilization' },
                { 'name': 'txData', 'title': 'Tx utilization' },
                { 'name': 'droppedData', 'title': 'Dropped' },
                { 'name': 'errorData', 'title': 'Error' }
            ];
        }

        // create data sets and add to dataSets store variable
        for (var i=0; i<graphTypes.length; i++) {
            var initialStats = new Stats();

            var data = new DataSet(
                graphTypes[i].name, i, { 'show': 1, 'colorIndex': i }, [],
                initialStats,
                { 'label': graphTypes[i].title,
                    'fillColor': this.state.colors[i].fill,
                    'strokeColor': this.state.colors[i].stroke,
                    'pointColor': this.state.colors[i].stroke,
                    'data': []
                },
                graphTypes[i].title
            );

            this.state.dataSets[graphTypes[i].name] = data;
        }
    },

    onLoadPortStatsCompleted: function(portStats) {

        // on the intial load - set the datasets variable
        // to have the correct data sets depending on
        // in the port is half or full duplex
        if (this.state.initialLoad) {
            this.state.initialLoad = 0;
            this.loadGraphs(portStats.data.duplex);
        }

        var linkSpeed = portStats.data.link_speed;
        var stats = portStats.data.statistics;
        var duplex = portStats.data.duplex;

        //Update port counters and data points
        this.state.portStats.previous = _.cloneDeep(this.state.portStats.current);
        this.state.portStats.current = stats;

        if (this.state.portStats.previous && this.state.portStats.current) {

            for (var key in this.state.dataSets) {
                if (this.state.dataSets.hasOwnProperty(key)) {
                    //var num = Math.floor(Math.random() * 100) + 0;
                    var num = this.calculateUtilization(duplex, linkSpeed, key);
                    var graph = this.state.dataSets[key];

                    if (graph.options.show) {
                        graph.allData.push(num);
                        graph.graphData.data.push(num);
                        this.updatePortStats(graph, num, key, stats);
                        this.updateAverage(graph);
                    } else {
                        this.state.dataSets[key].graphData.data.push(null);
                    }

                    // only show max number of points at a time
                    // start to scroll off the page when limi
                    // is hit
                    if (this.state.pointCount >= MAX_POINTS_ON_GRAPH) {
                        this.state.dataSets[key].graphData.data.shift();
                    }
                }
            }

            if (this.state.pointCount >= MAX_POINTS_ON_GRAPH) {
                this.state.labels.shift();
            } else {
                this.state.pointCount = this.state.pointCount + 1;
            }

            var date = DateStamp.hrsSecs(portStats.date);
            this.state.labels.push(date);
            this.trigger(this.state);
        }
    },

    //Callback for success of loading port list from server
    onLoadPortsCompleted: function(ports) {

        // loop through all interfaces and determine
        // if they are a port or not
        var list = [];
        for (var i in ports) {
            if (ports.hasOwnProperty(i)) {
                var port = ports[i].data;
                //port type as empty string means it is a port
                if (port.type === '') {
                    if (port.link_state[0] === 'up' && port.link_speed[0] > 0) {
                        list.push(Number(port.name));
                    }
                }
            }
        }

        // sort port list by number
        this.state.portList = list.sort(function(a, b) { return a-b; });
        this.state.selectedPort = this.state.portList[0];
        this.clearStats();

        // start the initial interval based off of
        // the first port returned in the port list
        var interval = setInterval(PortsMonitorActions.loadPortStats
            .bind(this, this.state.selectedPort), INTERVAL);
        this.state.interval = interval;
        this.trigger(this.state);
    },

    //handler to toggle the graph display
    onToggleGraphDisplay: function(key) {
        this.state.dataSets[key].options.show =
            1 - (this.state.dataSets[key].options.show);
        this.trigger(this.state);
    },

    //handler to reset the graph
    onResetGraph: function() {
        this.resetGraph();
    },

    //handler for user selected port in dropdown list
    onSetPortSelected: function(port) {
        clearInterval(this.state.interval);
        this.resetGraph();
        this.state.selectedPort = port;
        this.clearStats();
        this.trigger(this.state);
    },

    //handler to set the interval reference in the store
    onSetInterval: function(interval) {
        this.state.interval = interval;
        this.trigger(this.state);
    },

    //handler to set the name of the selected details to show
    onSetActiveDetails: function(name) {

        // toggle between line and bar graph
        if (this.state.activeDetails === name) {
            this.state.chartType = 'line';
            this.setInitialColors();
            this.state.activeDetails = null;
        } else {
            this.state.activeDetails = name;
            this.state.chartType = 'bar';
            this.showAll();
            this.setBarColors();
        }

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
        this.state.initialLoad = 1;
        this.state.portStats.current = null;
        this.state.portStats.prev = null;
        this.state.portSelected = null;
        this.state.playHandler = false;
        this.state.pauseHandler = true;

        // clear out the graph data
        for (var key in this.state.dataSets) {
            if (this.state.dataSets.hasOwnProperty(key)) {
                var graph = this.state.dataSets[key];
                graph.graphData.data = [];
            }
        }

        this.state.labels = [];
        this.trigger(this.state);
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
            index.stats.average = Cnvs.round1D((sum / index.allData.length));
        }
    },

    //update port stats for details panel
    updatePortStats: function(graph, num, key, stats) {

        // set the high value
        if (graph.stats.high) {
            graph.stats.high = num > graph.stats.high ? num :
                graph.stats.high;
        } else {
            graph.stats.high = num;
        }

        //set the low value
        if (graph.stats.low) {
            graph.stats.low = num < graph.stats.low ? num : graph.stats.low;
        } else {
            graph.stats.low = num;
        }

        //set the total bytes
        switch (key) {
            case 'rxData':
                graph.stats.total = stats.rx_bytes;
                break;
            case 'txData':
                graph.stats.total = stats.tx_bytes;
                break;
            case 'errorData':
                graph.stats.total = Number(stats.rx_errors) +
                    Number(stats.tx_errors);
                break;
            case 'droppedData':
                graph.stats.dropped = Number(stats.rx_dropped) +
                    Number(stats.tx_dropped);
                break;
            default:
                break;
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

    // color the bar chart bars to reflect
    // the bar chart color
    setBarColors: function() {
        var graph = this.state.dataSets[this.state.activeDetails];
        var colors = this.state.colors[graph.index];
        graph.graphData.fillColor = colors.stroke;
        graph.graphData.strokeColor = colors.stroke;
        this.trigger(this.state);
    },

    //rest all graphs to show data
    showAll: function() {
        for (var key in this.state.dataSets) {
            if (this.state.dataSets.hasOwnProperty(key)) {
                this.state.dataSets[key].options.show = 1;
            }
        }

        this.trigger(this.state);
    },

    // reset the line graph back to the correct colors
    // when switching back from the bar graph view
    setInitialColors: function() {
        for (var key in this.state.dataSets) {
            if (this.state.dataSets.hasOwnProperty(key)) {
                var graph = this.state.dataSets[key];
                var colorIndex = this.state.colors[graph.index];
                graph.graphData.fillColor = colorIndex.fill;
                graph.graphData.strokeColor = colorIndex.stroke;
            }
        }

        this.trigger(this.state);
    },

    // calculate utilization for full duplex
    calculateUtil: function(linkSpeed, key, stats) {
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
            case 'halfData':
                curr = stats.current ? Number(stats.current.rx_bytes)
                    + Number(stats.current.tx_bytes) : null;
                prev = stats.current ? Number(stats.previous.rx_bytes)
                    + Number(stats.previous.tx_bytes) : null;
        }

        util = Cnvs.round1D((Calcs.calcUtil(prev, curr, linkSpeed, INTERVAL)));
        return Number(util);
    },

    //calcualte port utilization handler
    calculateUtilization: function(duplex, linkSpeed, key) {
        var stats = this.state.portStats;
        var util;

        util = this.calculateUtil(linkSpeed, key, stats);
        return util;
    }

});
