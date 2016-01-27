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
 * Port monitor view.
 */

var React = require('react'),
    Reflux = require('reflux'),
    Router = require('react-router'),
    Navigation = require('react-router').Navigation,
    PropTypes = React.PropTypes,
    Link = Router.Link,
    Cnvs = require('conversions'),
    ChartUtils = require('chartUtils'),
    DateParse = require('dateParse'),
    ActionIcon = require('ActionIcon'),
    ViewBoxHeader = require('ViewBoxHeader'),
    GMenu = require('grommet/components/Menu'),
    GTable = require('grommet/components/Table'),
    GDropCaret = require('grommet/components/icons/DropCaret'),
    I18n = require('i18n'),
    PortsMonitorActions = require('PortsMonitorActions'),
    PortsMonitorStore = require('PortsMonitorStore'),
    StatusText = require('StatusText'),
    LineChart = require('react-chartjs').Line,
    BarChart = require('react-chartjs').Bar,
    ViewInitMixin = require('ViewInitMixin'),
    INTERVAL = 5000;

// internationalization for this view
function t(key) {
    return I18n.text('views.portMonitor.' + key);
}

// internationalization for units
function tUnits(key) {
    return I18n.text('units.' + key);
}

//Component to create a key and toggle button for each data line
//on the utillization chart
var GraphToggleButton = React.createClass({

    displayName: 'GraphToggleButton',

    propTypes: {
        color: PropTypes.string,
        text: PropTypes.string,
        click: PropTypes.func,
        index: PropTypes.number,
        show: PropTypes.number,
        cls: PropTypes.string
    },

    mixins: [
        ViewInitMixin
    ],

    render: function() {

        //determing the icon color
        var classes = null;
        if (this.props.show) {
            classes = 'color' + this.props.index;
        }

        return (
            <span className={'graphToggleWrapper ' + this.props.cls}>
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
                <GTable className="portDetails defaultTable">
                    <tbody>
                        <tr>
                            <td className="average">
                                <div className="main">{t('details.avg')}</div>
                            </td>
                            <td>
                                <div className="details" style={color}>
                                    {data.stats.average + ' %'}
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="main">{t('details.bytes')}</div>
                            </td>
                            <td>
                                <div className="details" style={color}>
                                    {Cnvs.round1D(
                                        Cnvs.bytesToMbytes(data.stats.total)
                                    ) + tUnits('mb')}
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="main">{t('details.high')}</div>
                            </td>
                            <td>
                                <div className="details" style={color}>
                                    {data.stats.high + ' %'}
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="main">{t('details.low')}</div>
                            </td>
                            <td>
                                <div className="details" style={color}>
                                    {data.stats.low + ' %'}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </GTable>
            </div>
        );
    }
});

module.exports = React.createClass({

    displayName: 'PortsMonitorView',

    //set data as reference to the ports store state data
    mixins: [
        Reflux.connect(PortsMonitorStore, 'data'),
        Router.State,
        Reflux.listenerMixin,
        Navigation
    ],

    componentDidMount: function() {
        //load the list of ports to populate the port list
        //dropdown menu
        PortsMonitorActions.loadPorts();
        this.listenTo(PortsMonitorActions.loadPorts.completed, this.onPortsLoad);
    },

    componentWillUnmount: function() {
        //stop the graph interval when component unmounts
        clearInterval(this.state.data.interval);
        PortsMonitorActions.resetGraph();
    },

    //listener call back to start interval when ports load
    onPortsLoad: function() {
        var port;
        if (this.getParams().port) {
            port = this.getParams().port;
        } else {
            port = this.state.data.selectedPort;
            this.transitionTo('/portMonitor/' + port);
        }

        this.portSelected(port);
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
        this.getPortData(port);
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
        var interval = setInterval(
            this.getPortData.bind(this, port),
            INTERVAL
        );
        PortsMonitorActions.setInterval(interval);
    },

    //initialize pause button
    initPause: function(pause) {
        return (
            <ActionIcon fa='pause'
                onClick={pause}
                className="smallIcon iconBorder right"
            />
        );
    },

    //initialize play button
    initPlay: function(play) {
        return (
            <ActionIcon fa='play'
                onClick={play}
                className="smallIcon"
            />
        );
    },

    //determine details graph icon style
    iconType: function(details, i) {
        return (details === i ? 'area-chart' : 'bar-chart');
    },

    render: function() {
        var st = this.state,
            dataSets = [],
            toggleToolbar = {},
            detailsPanels = [],
            chart, graphData, barGraphData, portNum,
            pause, play;

        portNum = st.data.selectedPort ? st.data.selectedPort : '';

        //append the port selection dropdown to the tile toolbar
        toggleToolbar.select = (
            <GMenu icon={<GDropCaret/>} label='Select Port'>
                {st.data.portList.map(function(port) {
                    return (
                        <Link to={'/portMonitor/' + port}
                            key={port}
                            params={{ 'port': port }}
                            onClick={this.portSelected.bind(this, port)}>
                            {port}
                        </Link>
                    );
                }, this)}
            </GMenu>
        );

        //append pause and play buttons to the tile toolbar
        pause = st.data.pauseHandler ? this.pauseGraph : null;
        play = st.data.playHandler ? this.playGraph : null;
        toggleToolbar.play = this.initPlay(play);
        toggleToolbar.pause = this.initPause(pause);

        // create the rest of the toggle toolbar based on the data sets
        for (var i in st.data.dataSets) {
            if (st.data.dataSets.hasOwnProperty(i)) {
                var dt = st.data,
                    data = dt.dataSets[i],
                    color = ChartUtils.colors[data.options.colorIndex].stroke,
                    onclick = this.toggleGraph.bind(this, i),
                    icon;

                // disable the toggle buttons when it is a bar graph
                if (dt.activeDetails !== null) {
                    onclick = null;
                }

                //append the graph key and toggle buttons to the
                //tile toolbar
                toggleToolbar[i] = (<GraphToggleButton
                    cls = {data.title}
                    color = {ChartUtils.colors[data.options.colorIndex].stroke}
                    text = {data.desc}
                    click = {onclick}
                    index = {data.options.colorIndex}
                    show = {data.options.show} />
                );


                // show correct icon to reflect switching between
                // graph types - line and bar
                icon = this.iconType(dt.activeDetails, i);

                // create status toolbar to switch between
                // graph types - line and bar
                var statusToolbar = {
                    status: <ActionIcon fa={icon}
                        onClick={this.showGraphStatus.bind(this, i)}/>
                };

                //create the row of details tiles based on the
                //datsets in the store
                detailsPanels.push(
                    <div key={i} className="viewBox fillRow">
                        <ViewBoxHeader title={data.desc}
                            toolbar={statusToolbar}/>
                        <div className="viewBoxContent">
                            <PortDetails color={color} data={data}/>
                        </div>
                    </div>
                );

                //setup the data sets
                dataSets.push(data.graphData);
            }

        }

        // Generate line graph data and keep it updating
        // as the state data updates
        graphData = {
            'labels': st.data.labels.map(function(ts) {
                return DateParse.convert(ts);
            }),
            'datasets': dataSets
        };

        // Generate bar graph data and keep it updating
        // as the state data updates
        barGraphData = st.data.activeDetails ? {
            'labels': st.data.labels.map(function(ts) {
                return DateParse.convert(ts);
            }),
            'datasets': [
                st.data.dataSets[st.data.activeDetails].graphData
            ]
        } : null;

        // determine if the chart shold be a line or bar
        // chart based off of the chartType in the store
        if (this.state.data.chartType === 'line') {
            chart = (
                <LineChart
                    data={graphData}
                    options={st.data.options}
                    width={600}
                    height={300}
                    redraw
                />
            );
        } else if (st.data.chartType === 'bar') {
            chart = (
                <BarChart
                    data={barGraphData}
                    options={st.data.options}
                    width={600}
                    height={300}
                    redraw
                />
            );
        }

        return (
            <div id="portsMonitorView" className="viewFill viewCol">
                <div id="portStatsGraphTile" className="viewBox viewFlex0">
                    <ViewBoxHeader title={t('portUtil') +
                        portNum}
                        toolbar= {toggleToolbar}/>
                        <div className="viewBoxContent">
                            <div id="canvasWrapper">
                                {st.data.portList.length ? chart :
                                    st.data.showStatusText ?
                                        <StatusText value='disabled'
                                            text={t('noPorts')} />
                                    : null}
                            </div>
                        </div>
                </div>
                <div className="portDetailsWrapper viewRow viewFlex0">
                    {detailsPanels}
                </div>
            </div>
        );
    }
});
