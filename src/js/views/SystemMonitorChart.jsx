/*
 * System monitor chart.
 * @author Frank Wood
 */

var React = require('react'),
    I18n = require('i18n'),
    Reflux = require('reflux'),
    ReactChart = require('react-chartjs'),
    BarChart = ReactChart.Bar,
    Router = require('react-router'),
    SystemMonitorStore = require('SystemMonitorStore'),
    SystemStatsActions = require('SystemStatsActions'),
    ChartUtils = require('chartUtils');

var AUTO_REFRESH_MILLIS = 5000,
    autoRefreshTimer;

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

    mkChartData: function(type) {
        var s = this.state,
            datasets = [],
            ci;

        if (type === 'temperature') {
            for (var i=0; i<s.temps.length; i++) {
                ci = i % ChartUtils.colors.length;
                datasets.push({
                    label: s.temps[i].name,
                    data: s.temps[i].data,
                    fillColor: ChartUtils.colors[ci].fill,
                    pointColor: ChartUtils.colors[ci].paint,
                    strokeColor: ChartUtils.colors[ci].stroke
                });
            }
        } else {
            datasets.push({
                data: s[type].data,
                fillColor: ChartUtils.colors[0].fill,
                pointColor: ChartUtils.colors[0].paint,
                strokeColor: ChartUtils.colors[0].stroke
            });
        }

        return {
            labels: this.state.dates.map(function(ts) {
                return new Date(ts).toLocaleTimeString(I18n.locale, {
                    hour12: false
                });
            }),
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
                scaleLabel: function(v) { return scaleLabel(v.value, type); },
                multiTooltipTemplate: '<%= datasetLabel %> - <%= value %>'
            };

        return (
            <div id="systemMonitorViewCanvas">
                <BarChart
                    data={this.mkChartData(type)}
                    options={chartOptions}
                    redraw
                />
            </div>
        );
    }

});
