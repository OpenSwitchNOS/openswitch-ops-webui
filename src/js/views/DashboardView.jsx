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
    ReactShuffle = require('react-shuffle');

var AUTO_REFRESH_MILLIS = 10000,
    autoRefreshTimer;

function t(key) {
    return I18n.text('views.dashboard.' + key);
}

function mkThresholds(maxVal) {
    return [
        { label: t('ok'), value: 0, colorIndex: 'ok' },
        { label: t('warn'), value: maxVal * 0.75, colorIndex: 'warning' },
        { label: t('err'), value: maxVal * 0.90, colorIndex: 'error' }
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

        // FIXME actions
        // DashboardActions.loadInfo();
        // DashboardActions.loadStats();
        // DashboardActions.loadTopPorts();
        // DashboardActions.loadTopVlans();

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
        var si = this.state.sysInfo;
        // TODO: get system status data (fan, power)
        return [
            [
                t('fanStatus'),
                <StatusText value="warning" text={t('warn')} />
            ], [
                t('powerStatus'),
                <StatusText value="ok" text={t('ok')} />
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
        // TODO: get data
        return [
            this.mkUtlMeter(t('port'), '1', 50),
            this.mkUtlMeter(t('port'), '2', 50),
            this.mkUtlMeter(t('port'), '3', 50),
            this.mkUtlMeter(t('port'), '4', 50),
            this.mkUtlMeter(t('port'), '5', 50)
        ];
    },

    mkVlanUtlMeters: function() {
        // TODO: get data
        return [
            this.mkUtlMeter(t('vlan'), '1', 50),
            this.mkUtlMeter(t('vlan'), '2', 50),
            this.mkUtlMeter(t('vlan'), '3', 50),
            this.mkUtlMeter(t('vlan'), '4', 50),
            this.mkUtlMeter(t('vlan'), '5', 50)
        ];
    },

    render: function() {
        var tb = {
                edit: <ActionIcon
                    fa="area-chart"
                    onClick={ this.onClickChart } />
            },
            // TODO: get data
            cpuVal = 0.3,
            cpuMaxVal = 1.0,
            storVal = 10,
            storMaxVal = 100,
            memVal = 15,
            memMaxVal = 16,
            tempVal = 33,
            tempMaxVal = 70;

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
                        {this.mkMeter(cpuVal, cpuMaxVal, '')}
                    </div>
                    <div className="viewBox box1">
                        <ViewBoxHeader title={t('storage')} toolbar={tb} />
                        {this.mkMeter(storVal, storMaxVal, t('storageUnits'))}
                    </div>
                </div>

                <div className="viewCol">
                    <div className="viewBox box1">
                        <ViewBoxHeader title={t('memory')} toolbar={tb} />
                        {this.mkMeter(memVal, memMaxVal, t('memoryUnits'))}
                    </div>
                    <div className="viewBox box1">
                        <ViewBoxHeader title={t('temp')} toolbar={tb} />
                        {this.mkMeter(tempVal, tempMaxVal, t('tempUnits'))}
                    </div>
                </div>

                <div className="viewBox">
                    <ViewBoxHeader title={t('portTopUtil')} toolbar={tb} />
                    <div className="viewBoxContent">
                        <ReactShuffle duration={3000} scale={false} fade={true}>
                            { this.mkPortUtlMeters() }
                        </ReactShuffle>
                    </div>
                </div>

                <div className="viewBox">
                    <ViewBoxHeader title={t('vlanTopUtil')} toolbar={tb} />
                    <div className="viewBoxContent">
                        <ReactShuffle duration={3000} scale={false} fade={true}>
                            { this.mkVlanUtlMeters() }
                        </ReactShuffle>
                    </div>
                </div>

            </div>
        );
    }

});
