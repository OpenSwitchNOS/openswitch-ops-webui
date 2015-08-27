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
    SystemMonitorStore = require('SystemMonitorStore'),
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

    mkLink: function(type) {
        return ( <Link to={'/systemMonitor/' + type}>{t(type)}</Link> );
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
                scaleLabel: function(v) { return scaleLabel(v.value, type); },
                multiTooltipTemplate: '<%= datasetLabel %> - <%= value %>'
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
