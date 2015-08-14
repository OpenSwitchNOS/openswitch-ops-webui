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
    TopUtilizationActions = require('TopUtilizationActions'),
    Lodash = require('lodash'),
    ObjectPath = require('object-path');

var AUTO_REFRESH_MILLIS = 10000,
    NUM_UTL_VIEW_SLOTS = 5,
    NUM_UTL_SLOTS = NUM_UTL_VIEW_SLOTS * 2,
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

    mixins: [ Reflux.listenTo(DashboardStore, 'onLoadAllCompleted') ],

    getInitialState: function() {
        var portSlots = [],
            vlanSlots = [];
        for (var i=0; i<NUM_UTL_SLOTS; i++) {
            portSlots.push( { key: 'k' + i, init: true, val: 0 } );
            vlanSlots.push( { key: 'k' + i, init: true, val: 0 } );
        }
        return {
            portSlots: portSlots,
            vlanSlots: vlanSlots,
            sysInfo: {},
            sysStats: {},
            topUtilPorts: [],
            topUtilVlans: []
        };
    },

    componentDidMount: function() {
        this.autoRefresh();
    },

    componentWillUnmount: function() {
        if (autoRefreshTimer) {
            clearTimeout(autoRefreshTimer);
        }
    },

    onLoadAllCompleted: function(data) {
        var newPortSlots,
            newVlanSlots;

        newPortSlots = this.updateSlots(this.state.portSlots, data.topUtilPorts,
            'id', 'stats.utilization');

        newVlanSlots = this.updateSlots(this.state.vlanSlots, data.topUtilVlans,
            'id', 'stats.utilization');

        this.setState({
            sysInfo: data.sysInfo,
            sysStats: data.sysStats,
            topUtilPorts: data.topUtilPorts,
            topUtilVlans: data.topUtilVlans,
            portSlots: newPortSlots,
            vlanSlots: newVlanSlots
        });
    },

    updateSlots: function(slots, dataItems, idKey, valKey) {
        var di, slotIdx, i, id, val,
            newSlots = Lodash.cloneDeep(slots);

        for (i=0; i<newSlots.length; i++) {
            delete newSlots[i].init; // assume already inited by this point
            newSlots[i].val = 0;
        }

        for (i=0; i<dataItems.length; i++) {
            di = dataItems[i];
            id = ObjectPath.get(di, idKey, 'id');
            val = ObjectPath.get(di, valKey, 'val');
            slotIdx = this.findSlotIdx(newSlots, id);
            if (slotIdx >= 0) {
                newSlots[slotIdx].id = id;
                newSlots[slotIdx].val = val;
            }
        }

        newSlots = newSlots.sort(function(a, b) {
            return b.val - a.val;
        });

        for (i=NUM_UTL_VIEW_SLOTS; i<NUM_UTL_SLOTS; i++) {
            delete newSlots[i].id;
        }

        return newSlots;
    },

    findSlotIdx: function(slots, id) {
        var i;
        // use existing slot if there is one
        for (i=0; i<slots.length; i++) {
            if (slots[i].id === id) {
                return i;
            }
        }
        // use first free slot
        for (i=0; i<slots.length; i++) {
            if (!slots[i].id) {
                return i;
            }
        }
        return -1;
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
        var v = val || 0,
            m = maxVal || 0,
            u = units || '';
        return (
            <GMeter className="viewBoxContent" type="arc" value={ v }
                min={{ value: 0, label: '0 ' + units }}
                max={{ value: m, label: m.toString() + ' ' + u }}
                thresholds={ mkThresholds(m) }
                units={ u } />
        );
    },

    mkUtlMeter: function(key, title, name, val) {
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

    mkUtlMeters: function(label, slots) {
        var meters = [],
            slot;
        for (var i=0; i<NUM_UTL_VIEW_SLOTS; i++) {
            slot = slots[i];
            meters.push(
                this.mkUtlMeter(slot.key, t(label), slot.id, slot.val)
            );
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
                        <ReactShuffle duration={1500} scale={false} fade={true}>
                            { this.mkUtlMeters('port', this.state.portSlots) }
                        </ReactShuffle>
                    </div>
                </div>

                <div className="viewBox">
                    <ViewBoxHeader title={t('vlanTopUtil')} toolbar={tb} />
                    <div className="viewBoxContent">
                        <ReactShuffle duration={1500} scale={false} fade={true}>
                            { this.mkUtlMeters('vlan', this.state.vlanSlots) }
                        </ReactShuffle>
                    </div>
                </div>

            </div>
        );
    }

});
