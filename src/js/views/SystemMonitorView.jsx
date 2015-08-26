/*
 * System monitor view.
 * @author Frank Wood
 */

var React = require('react'),
    I18n = require('i18n'),
    ReactChart = require('react-chartjs'),
    BarChart = ReactChart.Bar,
    ViewBoxHeader = require('ViewBoxHeader'),
    GMenu = require('grommet/components/Menu'),
    Router = require('react-router'),
    Link = Router.Link;

function t(key) {
    return I18n.text('views.systemMonitor.' + key);
}

module.exports = React.createClass({

    displayName: 'SystemMonitor',

    componentWillMount: function() {
        this.updateDimensions();
    },

    componentDidMount: function() {
        window.addEventListener('resize', this.updateDimensions);
        this.updateDimensions();
    },

    componentWillUnmount: function() {
        window.removeEventListener('resize', this.updateDimensions);
    },

    updateDimensions: function() {
        var canvasContainer = document.getElementById('systemMonitorViewCanvas');
        if (canvasContainer) {
            console.log('height: ' + canvasContainer.offsetHeight);
            console.log('width: ' + canvasContainer.offsetWidth);
        }
    },

    mkLink: function(key) {
        return (
            <Link to={'/systemMonitor/' + key}>
                {t(key)}
            </Link>
        );
    },

    render: function() {
        var barChartData,
            chart,
            options;

        barChartData = {
            labels: [ 'a', 'b', 'c' ],
            datasets: [
                {
                    data: [ 1.9, 0.25, 3.123 ],
                    fillColor: 'rgba(255,111,62,0.3)',
                    label: 'The Label',
                    pointColor: 'rgba(255,111,62,1)',
                    strokeColor: 'rgba(255,111,62,1)'
                }
            ]
        };

        options = {
            // animation: true,
            responsive: true,
            scaleBeginAtZero: true,
            maintainAspectRatio: false,
            scaleLabel: '<%=value + "%"%>'
        };

        chart = (
            <BarChart
                data={barChartData}
                options={options}
            />
        );

        return (
            <div id="systemMonitorView" className="viewFill viewCol">
                <div className="viewRow viewFlex1">
                    <div className="viewBox viewFlex1">
                        <ViewBoxHeader title={(
                            <GMenu direction="row">
                                {this.mkLink('cpu')}
                                {this.mkLink('memory')}
                                {this.mkLink('temperature')}
                                {this.mkLink('storage')}
                            </GMenu>
                        )} />
                        <div id="systemMonitorViewCanvas">
                            {chart}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

});
