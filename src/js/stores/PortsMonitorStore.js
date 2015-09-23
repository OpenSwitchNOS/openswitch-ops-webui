/*
 (C) Copyright 2015 Hewlett Packard Enterprise Development LP

    Licensed under the Apache License, Version 2.0 (the "License"); you may
    not use this file except in compliance with the License. You may obtain
    a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
    License for the specific language governing permissions and limitations
    under the License.
*/

/*
 * Data Store for the ports monitor view
 */

var Reflux = require('reflux'),
    PortsMonitorActions = require('PortsMonitorActions'),
    _ = require('lodash'),
    Calcs = require('calculations'),
    ChartUtils = require('chartUtils'),
    Cnvs = require('conversions'),
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

        //whether or no to show the status text insted
        //of the graphs
        showStatusText: 0,

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
            var initialStats = new Stats(),
                colors = ChartUtils.colors[i];

            var data = new DataSet(
                graphTypes[i].name, i, { 'show': 1, 'colorIndex': i }, [],
                initialStats,
                { 'label': graphTypes[i].title,
                    'fillColor': colors.fill,
                    'strokeColor': colors.stroke,
                    'pointColor': colors.stroke,
                    'data': []
                },
                graphTypes[i].title
            );

            this.state.dataSets[graphTypes[i].name] = data;
        }

        // when selecting a new port make sure the
        // bar graph colors are set if the chartType
        // is bar
        if (this.state.chartType === 'bar') {
            this.setBarColors();
        }

    },

    onLoadPortStatsCompleted: function(res) {
        var st = this.state,
            portStats = res.body.status; // FIXME below some of these are arrays?
        var date;

        // on the intial load - set the datasets variable
        // to have the correct data sets depending on
        // in the port is half or full duplex
        if (st.initialLoad) {
            st.initialLoad = 0;
            this.loadGraphs(portStats.duplex);
        }

        var linkSpeed = portStats.link_speed;
        var stats = res.body.statistics.statistics;
        var duplex = portStats.duplex;

        //Update port counters and data points
        st.portStats.previous = _.cloneDeep(st.portStats.current);
        st.portStats.current = stats;

        if (st.portStats.previous && st.portStats.current) {

            for (var key in st.dataSets) {
                if (st.dataSets.hasOwnProperty(key)) {
                    //var num = Math.floor(Math.random() * 100) + 0;
                    var num = this.calculateUtilization(duplex, linkSpeed, key);
                    var graph = st.dataSets[key];

                    if (graph.options.show) {
                        graph.allData.push(num);
                        graph.graphData.data.push(num);
                        this.updatePortStats(graph, num, key, stats);
                        this.updateAverage(graph);
                    } else {
                        st.dataSets[key].graphData.data.push(null);
                    }

                    // only show max number of points at a time
                    // start to scroll off the page when limi
                    // is hit
                    if (st.pointCount >= MAX_POINTS_ON_GRAPH) {
                        st.dataSets[key].graphData.data.shift();
                    }
                }
            }

            if (st.pointCount >= MAX_POINTS_ON_GRAPH) {
                st.labels.shift();
            } else {
                st.pointCount = st.pointCount + 1;
            }

            date = res.headers.date ? Date.parse(res.headers.date) : null;
            this.state.labels.push(date);
            this.trigger(this.state);
        }
    },

    //Callback for success of loading port list from server
    onLoadPortsCompleted: function(res) {
        var st = this.state,
            intfCfg, intfStatus, portNums = [];

        // loop through all interfaces and determine
        // if they are a port or not
        for (var i=0; i<res.length; i++) {
            intfCfg = res[i].body.configuration;
            intfStatus = res[i].body.status;
            //port type as empty string means it is a port
            if (intfCfg.type === 'system' &&
                intfStatus.link_state === 'up' &&
                intfStatus.link_speed > 0) {

                portNums.push(Number(intfCfg.name));
            }
        }

        // sort port list by number
        st.portList = portNums.sort(function(a, b) { return a-b; });

        if (!st.selectedPort) {
            st.selectedPort = st.portList[0];
        }
        this.clearStats();

        //determine whether or not to set the status text
        if (st.portList.length === 0 ) {
            st.showStatusText = 1;
        }

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
                data.stats.high = 0;
                data.stats.total = 0;
            }
        }
    },

    //reset the graph and canvas
    resetGraph: function() {

        var st = this.state;
        //reset the counters
        st.pointCount = 0;
        st.secondsCount = 0;
        st.initialLoad = 1;
        st.portStats.current = null;
        st.portStats.prev = null;
        st.portSelected = null;
        st.playHandler = false;
        st.pauseHandler = true;

        // clear out the graph data
        for (var key in st.dataSets) {
            if (st.dataSets.hasOwnProperty(key)) {
                var graph = st.dataSets[key];
                graph.graphData.data = [];
            }
        }

        st.labels = [];
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
        var colors = ChartUtils.colors[graph.index];
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
                var colorIndex = ChartUtils.colors[graph.index];
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
