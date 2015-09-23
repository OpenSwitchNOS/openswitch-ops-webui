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
 * System monitor chart.
 */

var React = require('react'),
    I18n = require('i18n'),
    Reflux = require('reflux'),
    ReactChart = require('react-chartjs'),
    LineChart = ReactChart.Line,
    Router = require('react-router'),
    SystemMonitorStore = require('SystemMonitorStore'),
    SystemStatsActions = require('SystemStatsActions'),
    DateParse = require('dateParse'),
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
                    pointColor: ChartUtils.colors[ci].stroke,
                    strokeColor: ChartUtils.colors[ci].stroke
                });
                datasets.sort(function(d1, d2) {
                    return (d1.label > d2.label) ?
                        1 : ((d2.name > d1.name) ? -1 : 0);
                });
            }
        } else {
            datasets.push({
                data: s[type].data,
                fillColor: ChartUtils.colors[0].fill,
                pointColor: ChartUtils.colors[0].stroke,
                strokeColor: ChartUtils.colors[0].stroke
            });
        }

        return {
            labels: this.state.dates.map(function(ts) {
                return DateParse.convert(ts);
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
                <LineChart
                    data={this.mkChartData(type)}
                    options={chartOptions}
                    redraw
                />
            </div>
        );
    }

});
