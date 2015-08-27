/*
 * System monitor view.
 * @author Frank Wood
 */

var React = require('react'),
    I18n = require('i18n'),
    Reflux = require('reflux'),
    ReactChart = require('react-chartjs'),
    BarChart = ReactChart.Bar,
    ViewBoxHeader = require('ViewBoxHeader'),
    GMenu = require('grommet/components/Menu'),
    Router = require('react-router'),
    Link = Router.Link,
    SystemStatsActions = require('SystemStatsActions'),
    SystemMonitorStore = require('SystemMonitorStore');

var AUTO_REFRESH_MILLIS = 5000,
    autoRefreshTimer,
    CHART_COLORS = [ // FIXME put this is global settings?
        {
            stroke: 'rgba(255,111,62,1)',
            fill: 'rgba(255,111,62,0.3)',
            light: 'rgba(255,111,62,0.1)'
        },
        {
            stroke: 'rgba(61,141,155,1)',
            fill: 'rgba(61,141,155,0.3)',
            light: 'rgba(61,141,155,0.1)'
        },
        {
            stroke: 'rgba(211,154,66,1)',
            fill: 'rgba(211,154,66,0.3)',
            light: 'rgba(211,154,66,0.1)'
        },
        {
            stroke: 'rgba(101,57,164,1)',
            fill: 'rgba(101,57,164,0.3)',
            light: 'rgba(101,57,164,0.1)'
        }
    ];

function t(key) {
    return I18n.text('views.systemMonitor.' + key);
}

function scaleLabel(value, type) {
    var units = '';

    if (type === 'memory' || type === 'storage') {
        units = t('gb');
    } else if (type === 'temperature') {
        units = t('deg');
    }

    return Number(value).toFixed(1) + ' ' + units;
}

module.exports = React.createClass({

    displayName: 'SystemMonitor',

    mixins: [
        Reflux.connect(SystemMonitorStore),
        Router.State
    ],

    componentDidMount: function() {
        this.autoRefresh();
    },

    componentWillUnmount: function() {
        if (autoRefreshTimer) {
            clearTimeout(autoRefreshTimer);
        }
    },

    autoRefresh: function() {
        var recurFn = this.autoRefresh;

        SystemStatsActions.load();

        autoRefreshTimer = setTimeout(function() {
            recurFn();
        }, AUTO_REFRESH_MILLIS);
    },

    mkLink: function(type) {
        return ( <Link to={'/systemMonitor/' + type}>{t(type)}</Link> );
    },

    mkChartData: function(type) {
        var s = this.state,
            datasets = [],
            ci;

        if (type === 'temperature') {
            for (var i=0; i<s.temps.length; i++) {
                ci = i % CHART_COLORS.length;
                datasets.push({
                    data: s.temps[i].data,
                    fillColor: CHART_COLORS[ci].fill,
                    pointColor: CHART_COLORS[ci].paint,
                    strokeColor: CHART_COLORS[ci].stroke
                });
            }
        } else {
            datasets.push({
                data: s[type].data,
                fillColor: CHART_COLORS[0].fill,
                pointColor: CHART_COLORS[0].paint,
                strokeColor: CHART_COLORS[0].stroke
            });
        }

        return {
            labels: this.state.ts,
            datasets: datasets
        };
    },

    render: function() {
        var type = this.getParams().type,
            chartOptions = {
                animation: false,
                responsive: true,
                scaleBeginAtZero: true,
                maintainAspectRatio: false,
                scaleLabel: function(v) { return scaleLabel(v.value, type); }
            };

        return (
            <div id="systemMonitorView" className="viewFill viewCol">
                <div className="viewRow">
                    <div className="viewBox viewFlex1">
                        <ViewBoxHeader title=
                            <GMenu direction="row">
                                {this.mkLink('cpu')}
                                {this.mkLink('memory')}
                                {this.mkLink('temperature')}
                                {this.mkLink('storage')}
                            </GMenu>
                        />
                        <div id="systemMonitorViewCanvas">
                        <BarChart
                            data={this.mkChartData(type)}
                            options={chartOptions}
                            redraw
                        />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

});
