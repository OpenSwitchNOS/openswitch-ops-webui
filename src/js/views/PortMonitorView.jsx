/*
 * Port monitor view.
 * @author Kelsey Dedoshka
 */

//FIXME - add react-chartjs to node module file
var React = require('react'),
    Reflux = require('reflux'),
    PropTypes = React.PropTypes,
    ActionIcon = require('ActionIcon'),
    ViewBoxHeader = require('ViewBoxHeader'),
    GMenu = require('grommet/components/Menu'),
    GDropCaret = require('grommet/components/icons/DropCaret'),
    I18n = require('i18n'),
    PortsMonitorActions = require('PortsMonitorActions'),
    PortsMonitorStore = require('PortsMonitorStore'),
    LineChart = require('react-chartjs').Line,
    BarChart = require('react-chartjs').Bar,
    INTERVAL = 5000;


//Component to create a key and toggle button for each data line
//on the utillization chart
var GraphToggleButton = React.createClass({

    displayName: 'GraphToggleButton',

    propTypes: {
        color: PropTypes.string,
        text: PropTypes.string,
        click: PropTypes.func,
        index: PropTypes.number,
        show: PropTypes.bool
    },

    render: function() {

        //determing the icon color
        var classes = null;
        if (this.props.show) {
            classes = 'color' + this.props.index;
        }

        return (
            <span className="graphToggleWrapper">
                <ActionIcon fa="area-chart"
                    onClick={this.props.click}
                    color={this.props.color}
                    className={classes}/>
                <span className="toggleText">{this.props.text}</span>
            </span>
        );
    }
});


//Component to create a details tile panel displayed below the
//utilization graph. This includes: utilization average, and
//a breakdown between high, low and medium utilization
var PortDetails = React.createClass({

    displayName: 'PortDetails',

    propTypes: {
        color: PropTypes.string,
        data: PropTypes.object
    },

    render: function() {

        // determine color to display
        // table stats text as
        var color = { color: this.props.color },
            data = this.props.data;

        return (
            <div className="innerContainer">
                <table className="portDetails defaultTable">
                    <tr>
                        <td className="average">
                            <div className="title">Average</div>
                        </td>
                        <td>
                            <div className="details" style={color}>
                                {data.stats.average + ' %'}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div className="title">Total Bytes</div>
                        </td>
                        <td>
                            <div className="details" style={color}>
                                {data.stats.total}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div className="title">Highest Utilization</div>
                        </td>
                        <td>
                            <div className="details" style={color}>
                                {data.stats.high + ' %'}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div className="title">Lowest Utilization</div>
                        </td>
                        <td>
                            <div className="details" style={color}>
                                {data.stats.low + ' %'}
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        );
    }
});

module.exports = React.createClass({

    displayName: 'PortsMonitorView',

    //set data as reference to the ports store state data
    mixins: [ Reflux.connect(PortsMonitorStore, 'data') ],

    componentDidMount: function() {
        //load the list of ports to populate the port list
        //dropdown menu
        PortsMonitorActions.loadPorts();
    },

    componentWillUnmount: function() {
        //stop the graph interval when component unmounts
        clearInterval(this.state.data.interval);
        PortsMonitorActions.resetGraph();
    },

    //toggle the state of the graph being displayed on
    //the chart
    toggleGraph: function(key) {
        PortsMonitorActions.toggleGraphDisplay(key);
    },

    //show the status of the selected graph
    showGraphStatus: function(name) {
        PortsMonitorActions.setActiveDetails(name);
        PortsMonitorActions.showStatus(name);
    },

    //handler for selected a port in the dropdown menu
    portSelected: function(port) {
        PortsMonitorActions.setPortSelected(port);
        this.startInterval(port);
    },

    //handler to get the port utilization data
    getPortData: function(port) {
        PortsMonitorActions.loadPortStats(port);
    },

    //handler to play the graph
    playGraph: function() {
        PortsMonitorActions.setPausePlayHandler('play', false);
        PortsMonitorActions.setPausePlayHandler('pause', true);
        this.startInterval(this.state.data.selectedPort);
    },

    //handler to pause the graph
    pauseGraph: function() {
        PortsMonitorActions.setPausePlayHandler('play', true);
        PortsMonitorActions.setPausePlayHandler('pause', false);
        clearInterval(this.state.data.interval);
    },

    //start the graph interval and set the state in the store
    startInterval(port) {
        var interval = setInterval(this.getPortData.bind(this, port),
            INTERVAL);
        PortsMonitorActions.setInterval(interval);
    },

    render: function() {
        var t = I18n.text,
            dataSets = [],
            toggleToolbar = {},
            detailsPanels = [],
            chart, graphData, barGraphData, portNum,
            pause, play;

        // get port number to display in the title
        portNum = this.state.data.selectedPort ?
            this.state.data.selectedPort : '';

        //append the port selection dropdown to the tile toolbar
        toggleToolbar.select = (
            <GMenu icon={<GDropCaret/>} label='Select Port'>
                {this.state.data.portList.map(function(port) {
                    return (
                        <div className="portSelectionItem"
                            onClick={this.portSelected.bind(this, port)}>
                                {port}
                        </div>
                    );
                }, this)}
            </GMenu>
        );

        //append pause and play buttons to the tile toolbar
        pause = this.state.data.pauseHandler ? this.pauseGraph : null;
        play = this.state.data.playHandler ? this.playGraph : null;

        toggleToolbar.play = (<ActionIcon fa='play'
            onClick={play}
            className="smallIcon" />);

        toggleToolbar.pause = (<ActionIcon fa='pause'
            onClick={pause}
            className="smallIcon iconBorder right"/>);

        // create the rest of the toggle toolbar based on the data sets
        for (var i in this.state.data.dataSets) {
            if (this.state.data.dataSets.hasOwnProperty(i)) {
                var data = this.state.data.dataSets[i];
                var color = this.state.data.colors[data.options.colorIndex].stroke;
                var onclick = this.toggleGraph.bind(this, i);

                // disable the toggle buttons when it is a bar graph
                if (this.state.data.activeDetails !== null) {
                    onclick = null;
                }

                //append the graph key and toggle buttons to the
                //tile toolbar
                toggleToolbar[i] = (<GraphToggleButton
                    color = {this.state.data.colors[data.options.colorIndex].stroke}
                    text = {data.desc}
                    click = {onclick}
                    index = {data.options.colorIndex}
                    show = {data.options.show} />);


                // show correct icon to reflect switching between
                // graph types - line and bar
                var icon = 'bar-chart';
                if (this.state.data.activeDetails === i) {
                    icon = 'area-chart';
                }

                // create status toolbar to switch between
                // graph types - line and bar
                var statusToolbar = {
                    status: <ActionIcon fa={icon}
                        onClick={this.showGraphStatus.bind(this, i)}/>
                };

                //create the row of details tiles based on the
                //datsets in the store
                detailsPanels.push(
                    <div className="viewBox viewFlex1">
                        <ViewBoxHeader title={data.desc}
                            toolbar={statusToolbar}/>
                        <PortDetails color={color} data={data}/>
                    </div>
                );

                //setup the data sets
                dataSets.push(data.graphData);
            }

        }


        // Generate line graph data and keep it updating
        // as the state data updates
        graphData = {
            'labels': this.state.data.labels,
            'datasets': dataSets
        };

        // Generate bar graph data and keep it updating
        // as the state data updates
        barGraphData = this.state.data.activeDetails ? {
            'labels': this.state.data.labels,
            'datasets': [
                this.state.data.dataSets[this.state.data.activeDetails].graphData
            ]
        } : null;

        // determine if the chart shold be a line or bar
        // chart based off of the chartType in the store
        if (this.state.data.chartType === 'line') {
            chart = (<LineChart data={graphData} options={this.state.data.options}
                width={600} height={300} redraw/>);
        } else if (this.state.data.chartType === 'bar') {
            chart = (<BarChart data={barGraphData} options={this.state.data.options}
                width={600} height={300} redraw/>);
        }

        return (
            <div className="viewFill viewCol">
                <div id="portStatsGraphTile" className="viewBox viewFlex0">
                    <ViewBoxHeader title={t('views.portMonitor.portUtil') +
                        portNum}
                        toolbar= {toggleToolbar}/>
                        <div id="canvasWrapper">
                            {chart}
                        </div>
                </div>
                <div className="portDetailsWrapper viewRow viewFlex0">
                    {detailsPanels}
                </div>
            </div>
        );
    }
});
