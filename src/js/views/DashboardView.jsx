/*
 * Dashboard view.
 * @author Frank Wood
 */

var React = require('react/addons'),
    Reflux = require('reflux'),
    I18n = require('i18n'),
    ViewBoxHeader = require('ViewBoxHeader'),
    ActionIcon = require('ActionIcon'),
    PropTable = require('PropTable'),
    DashboardStore = require('DashboardStore'),
    StatusText = require('StatusText'),
    GMeter = require('grommet/components/Meter'),
    ReactShuffle = require('react-shuffle'),
    SystemInfoActions = require('SystemInfoActions'),
    SystemStatsActions = require('SystemStatsActions'),
    TopUtilizationActions = require('TopUtilizationActions');

var AUTO_REFRESH_MILLIS = 10000,
    autoRefreshTimer;

function t(key) {
    return I18n.text('views.dashboard.' + key);
}

function mkThresholds(maxVal) {
    return [
        { label: t('ok'), value: 0, colorIndex: 'ok' },
        { label: t('warning'), value: maxVal * 0.75, colorIndex: 'warning' },
        { label: t('error'), value: maxVal * 0.90, colorIndex: 'error' }
    ];
}

module.exports = React.createClass({

    displayName: 'DashboardView',

    mixins: [ Reflux.connect(DashboardStore) ],

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

        SystemInfoActions.load();
        SystemStatsActions.load();
        TopUtilizationActions.load();

        autoRefreshTimer = setTimeout(function() {
            recurFn();
        }, AUTO_REFRESH_MILLIS);
    },

    onClickChart: function() {
        alert('Clicked chart icon.');
    },

    mkSysInfoPropData: function() {
        var si = this.state.sysInfo;
        return [
            [ t('productName'), si.product_name ],
            [ t('vendor'), si.vendor ],
            [ t('version'), si.version ],
            [ t('onieVersion'), si.onie_version ],
            [ t('baseMac'), si.base_mac_address ]
        ];
    },

    mkSysStatusPropData: function() {
        var si = this.state.sysStats,
            fan = si.fan_status,
            pwr = si.power_status;

        return [
            [
                t('fanStatus'),
                fan ? <StatusText value={fan} text={t(fan)} /> : null
            ], [
                t('powerStatus'),
                pwr ? <StatusText value={pwr} text={t(pwr)} /> : null
            ],
            [ t('upTime'), si.up_time ]
        ];
    },

    mkMeter: function(val, maxVal, units) {
        return (
            <GMeter className="viewBoxContent" type="arc" value={ val }
                min={{ value: 0, label: '0 ' + units }}
                max={{ value: maxVal, label: maxVal.toString() + ' ' + units }}
                thresholds={ mkThresholds(maxVal) }
                units={ units } />
        );
    },

    mkUtlMeter: function(title, name, val) {
        var key = title + name;
        return (
            <div key={key} className="utilizationRow">
                <div>
                    <b>{ title }:&nbsp;</b><span>{ name }</span>
                </div>
                <GMeter value={ val }
                    min={ { value: 0, label: '0%' } }
                    max={ { value: 100, label: '100%' } }
                    thresholds={ mkThresholds(100) }
                    units="%" />
            </div>
        );
    },

    mkPortUtlMeters: function() {
        var ports = this.state.topUtilPorts,
            meters = [],
            p;
        for (var i=0; i<ports.length; i++) {
            p = ports[i];
            meters.push(
                this.mkUtlMeter(t('port'), p.id, p.stats.utilization)
            )
        }
        return meters;
    },

    mkVlanUtlMeters: function() {
        var vlans = this.state.topUtilVlans,
            meters = [],
            v;
        for (var i=0; i<vlans.length; i++) {
            v = vlans[i];
            meters.push(
                this.mkUtlMeter(t('vlan'), v.name, v.stats.utilization)
            )
        }
        return meters;
    },

    render: function() {
        var tb = {
                edit: <ActionIcon
                    fa="area-chart"
                    onClick={ this.onClickChart } />
            },
            si = this.state.sysStats;

        return (
            <div id="dashboardView" className="viewRow">

                <div className="viewCol">
                    <div className="viewBox box1">
                        <ViewBoxHeader
                            title={t('systemInfo')} toolbar={tb} />
                        <PropTable
                            className="viewBoxContent"
                            data={this.mkSysInfoPropData()} />
                    </div>

                    <div className="viewBox box1">
                        <ViewBoxHeader
                            title={t('systemStatus')} toolbar={tb} />
                        <PropTable
                            className="viewBoxContent"
                            data={this.mkSysStatusPropData()} />
                    </div>
                </div>

                <div className="viewCol">
                    <div className="viewBox box1">
                        <ViewBoxHeader title={t('cpu')} toolbar={tb} />
                        {this.mkMeter(si.cpu, si.cpu_max, '')}
                    </div>
                    <div className="viewBox box1">
                        <ViewBoxHeader title={t('storage')} toolbar={tb} />
                        {this.mkMeter(si.stor, si.stor_max, t('storageUnits'))}
                    </div>
                </div>

                <div className="viewCol">
                    <div className="viewBox box1">
                        <ViewBoxHeader title={t('memory')} toolbar={tb} />
                        {this.mkMeter(si.mem, si.mem_max, t('memoryUnits'))}
                    </div>
                    <div className="viewBox box1">
                        <ViewBoxHeader title={t('temp')} toolbar={tb} />
                        {this.mkMeter(si.temp, si.temp_max, t('tempUnits'))}
                    </div>
                </div>

                <div className="viewBox">
                    <ViewBoxHeader title={t('portTopUtil')} toolbar={tb} />
                    <div className="viewBoxContent">
                            { this.mkPortUtlMeters() }
                    </div>
                </div>

                <div className="viewBox">
                    <ViewBoxHeader title={t('vlanTopUtil')} toolbar={tb} />
                    <div className="viewBoxContent">
                            { this.mkVlanUtlMeters() }
                    </div>
                </div>

            </div>
        );
    }

});
