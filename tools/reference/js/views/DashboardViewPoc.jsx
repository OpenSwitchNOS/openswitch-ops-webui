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
 * Dashboard view.
 */

// TODO: stagger load times so we don't wait 10 seconds.
// TODO: show 'Fans: () OK (count 10);
// TODO: show 'Power Supplies: () OK (base-1)'
// TODO: Warning: setState(...): Can only update a mounted or mounting component. This usually means you called setState() on an unmounted component. This is a no-op.

var React = require('react/addons'),
    Reflux = require('reflux'),
    Navigation = require('react-router').Navigation,
    I18n = require('i18n'),
    ViewBoxHeader = require('ViewBoxHeader'),
    ActionIcon = require('ActionIcon'),
    PropTable = require('PropTable'),
    DashboardStore = require('DashboardStorePoc'),
    StatusText = require('StatusText'),
    GMeter = require('grommet/components/Meter'),
    ReactShuffle = require('react-shuffle'),
    SystemInfoActions = require('SystemInfoActions'),
    SystemStatsActions = require('SystemStatsActions'),
    InterfaceActions = require('InterfaceActionsPoc'),
    Lodash = require('lodash'),
    ViewInitMixin = require('ViewInitMixin');

var AUTO_REFRESH_MILLIS = 10000,
    NUM_UTL_VIEW_SLOTS = 6,
    NUM_UTL_SLOTS = NUM_UTL_VIEW_SLOTS * 2,
    METER_MAX_VAL_ADJ = 0.1,
    autoRefreshCount = 0,
    autoRefreshTimer,
    infSlots = [],
    infSlotIdx;

for (infSlotIdx=0; infSlotIdx<NUM_UTL_SLOTS; infSlotIdx++) {
    infSlots.push({ key: 'k' + infSlotIdx, init: true, val: 0 });
};

// TODO: Fix for grommet max value (no bar).
// TODO: Make sure data is consistent (strings vs numbers).

function t(key) {
    return I18n.text('views.dashboardPoc.' + key);
}

function mkThresholds(maxVal) {
    return [
        { label: t('ok'), value: 0, colorIndex: 'ok' },
        { label: t('warning'), value: maxVal * 0.75, colorIndex: 'warning' },
        { label: t('error'), value: maxVal * 0.90, colorIndex: 'error' }
    ];
}

function findSlotIdx(slots, id) {
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
}

module.exports = React.createClass({

    displayName: 'DashboardViewPoc',

    mixins: [
        Reflux.connect(DashboardStore),
        Navigation,
        ViewInitMixin
    ],

    componentDidMount: function() {
        SystemInfoActions.load();
        this.autoRefresh();
    },

    componentWillUnmount: function() {
        if (autoRefreshTimer) {
            clearTimeout(autoRefreshTimer);
        }
    },

    staggerLoad: function(dataGroup) {
        var mod;
        if (autoRefreshCount === 0) {
            return true;
        }
        mod = autoRefreshCount % 2;
        if (dataGroup === 'stats') {
            return mod === 0;
        }
        if (dataGroup === 'infs') {
            return mod === 1;
        }
        return false;
    },

    autoRefresh: function() {
        var recurFn = this.autoRefresh;

        if (autoRefreshCount % 2 === 0) {
            SystemStatsActions.load();
        } else if (autoRefreshCount % 2 === 1) {
            InterfaceActions.load();
        }

        autoRefreshCount++;

        autoRefreshTimer = setTimeout(function() {
            recurFn();
        }, AUTO_REFRESH_MILLIS);
    },

    updateInfSlots: function() {
        var i,
            topInf,
            slotIdx,
            topInfId,
            newInfSlots,
            newTopUtilInfs = this.state.interfaceStats.topUtilization;

        if (!newTopUtilInfs || newTopUtilInfs.length === 0) {
            return false;
        }

        newInfSlots = Lodash.cloneDeep(infSlots);

        for (i=0; i<newInfSlots.length; i++) {
            delete newInfSlots[i].init; // assume already inited by this point
            newInfSlots[i].val = 0;
        }

        for (i=0; i<newTopUtilInfs.length; i++) {
            topInf = newTopUtilInfs[i];
            topInfId = topInf.ci.name + ' ' + t(topInf.dir); // (i.e. 3 Tx)
            slotIdx = findSlotIdx(newInfSlots, topInfId);
            if (slotIdx >= 0) {
                newInfSlots[slotIdx].id = topInfId;
                newInfSlots[slotIdx].val = topInf.utl;
                newInfSlots[slotIdx].dir = topInf.dir;
                newInfSlots[slotIdx].name = topInf.ci.name;
            }
        }

        newInfSlots = newInfSlots.sort(function(a, b) {
            if (a.id && !b.id) {
                return -1;
            } else if (!a.id && b.id) {
                return 1;
            }
            return b.val - a.val;
        });

        for (i=NUM_UTL_VIEW_SLOTS; i<NUM_UTL_SLOTS; i++) {
            delete newInfSlots[i].id;
        }

        infSlots = newInfSlots;
        return true;
    },

    mkSysInfoPropData: function() {
        var si = this.state.sysInfo,
            ss = this.state.sysStats,
            fans = ss.fans,
            pwrs = ss.powerSupplies,
            fanPropVal,
            status,
            fanCount,
            pwrPropVal1,
            pwrPropVal2;

        if (fans && fans.length > 0) {
            fanCount = fans.length;
            status = 'ok';
            for (var i=0; i<fans.length; i++) {
                if (fans[i].status !== 'ok') {
                    status = fans[i].status;
                    break;
                }
            }
            fanPropVal = (
                <StatusText
                    value={status}
                    text={t(status) + ' (' + fanCount + ')'}
                />
            );
        }

        // TODO: add variable number of supplies read from DB
        if (pwrs && pwrs.length === 2) {
            pwrPropVal1 = (
                <StatusText value={pwrs[0].status} text={t(pwrs[0].text)} />
            );
            pwrPropVal2 = (
                <StatusText value={pwrs[1].status} text={t(pwrs[1].text)} />
            );
        }

        return [
            [ t('productName'), si.productName ],
            [ t('vendor'), si.vendor ],
            [ t('version'), si.version ],
            [ t('onieVersion'), si.onieVersion ],
            [ t('baseMac'), si.baseMac ],
            [ '', '' ],
            [ t('fanStatus'), fanPropVal ],
            [ t('powerSupplyLabel') + ' 1', pwrPropVal1 ],
            [ t('powerSupplyLabel') + ' 2', pwrPropVal2 ]
        ];
    },

    mkMeter: function(val, maxVal, units) {
        var v = Math.round((val || 0) * 10) / 10,
            m = Math.round((maxVal || 0) * 10) / 10,
            u = units || '';
        return (
            <GMeter className="viewBoxContent margin"
                small={true}
                type="arc"
                value={ v }
                min={{
                    value: 0,
                    label: '0 ' + u
                }}
                max={{
                    value: m + METER_MAX_VAL_ADJ,
                    label: m.toString() + ' ' + u
                }}
                thresholds={ mkThresholds(m) } />
        );
    },

    mkTempMeter: function(item) {
        var u = t('tempUnits'),
            max = (item.max * 1.5); // FIXME: temp val always max?
        return (
            <div key={item.name} className="tempRow">
                <div><b>{item.name + ': '}</b>{item.loc}</div>
                <GMeter
                    value={Math.round(item.val * 10) / 10}
                    min={{
                        value: item.min,
                        label: item.min.toFixed(1) + ' ' + u
                    }}
                    max={{
                        value: max + METER_MAX_VAL_ADJ,
                        label: max.toFixed(1) + ' ' + u
                    }}
                    thresholds={mkThresholds(max)}
                    units={u} />
            </div>
        );
    },

    mkTempMeters: function() {
        var temps = this.state.sysStats.temps || [];
        return (
            <div className="viewBoxContent margin">
                { temps.map(function(item) {
                    return this.mkTempMeter(item);
                }.bind(this))}
            </div>
        );
    },

    mkUtlMeter: function(slot) {
        return (
            <div key={ slot.key } className="utilizationRow">
                <div>
                    <b>{ t('port') }:&nbsp;</b>
                    <span>{ slot.id }</span>
                </div>
                <GMeter value={ Math.round(slot.val * 10) / 10 }
                    min={{
                        value: 0,
                        label: '0%'
                    }}
                    max={{
                        value: 100 + METER_MAX_VAL_ADJ,
                        label: '100%'
                    }}
                    thresholds={ mkThresholds(100) }
                    units="%" />
            </div>
        );
    },

    mkUtlMeters: function() {
        var meters = [];
        for (var i=0; i<NUM_UTL_VIEW_SLOTS; i++) {
            meters.push( this.mkUtlMeter(infSlots[i]) );
        }
        return meters;
    },

    mkUtlTb: function() {
        var transTo = this.transitionTo,
            toFn;

        if (infSlots.length > 0) {
            toFn = infSlots[0].name ?
                function() { transTo('/portMonitor/' + infSlots[0].name); }
                : null;
            return {
                edit: <ActionIcon
                    fa="area-chart"
                    onClick={ toFn }
                />
            };
        }
        return {};
    },

    mkSysTb: function(type) {
        var transTo = this.transitionTo,
            toFn = function() { transTo('/systemMonitor/' + type); };
        return {
            edit: <ActionIcon
                fa="area-chart"
                onClick={ toFn }
            />
        };
    },

    render: function() {
        var si = this.state.sysStats,
            haveInfData = this.updateInfSlots();

        return (
            <div id="dashboardView" className="viewCol">

                <div className="viewRow">
                    <div className="viewCol">
                        <div className="viewBox">
                            <ViewBoxHeader title={t('systemInfo')} />
                            <PropTable
                                className="viewBoxContent margin"
                                data={this.mkSysInfoPropData()} />
                        </div>
                        <div className="viewBox">
                            <ViewBoxHeader
                                title={t('temp')}
                                toolbar={this.mkSysTb('temperature')} />
                            {this.mkTempMeters()}
                        </div>
                    </div>
                    <div className="viewCol spaceBetween">
                        <div className="viewBox">
                            <ViewBoxHeader
                                title={t('cpu')}
                                toolbar={this.mkSysTb('cpu')} />
                                <div className="viewBoxContent margin center">
                                    {this.mkMeter(si.cpuVal, si.cpuMax, '')}
                                </div>
                        </div>
                        <div className="viewBox">
                            <ViewBoxHeader
                                title={t('memory')}
                                toolbar={this.mkSysTb('memory')} />
                                <div className="viewBoxContent margin center">
                                    {this.mkMeter(si.memVal, si.memMax, t('memoryUnits'))}
                                </div>
                        </div>
                        <div className="viewBox">
                            <ViewBoxHeader title={t('storage')} />
                            <div className="viewBoxContent margin center">
                                {this.mkMeter(si.storVal, si.storMax, t('storageUnits'))}
                            </div>
                        </div>
                    </div>
                    <div className="viewBox">
                        <ViewBoxHeader
                            title={t('portTopUtil')}
                            toolbar={this.mkUtlTb()} />
                        <div className="viewBoxContent margin">
                            { haveInfData ?
                                <ReactShuffle duration={1500} scale={false} fade={true}>
                                    {this.mkUtlMeters()}
                                </ReactShuffle> :
                                t('loadingInfData') }
                        </div>
                    </div>
                </div>

            </div>
        );
    }

});
