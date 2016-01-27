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
 * LAG view.
 */

var React = require('react'),
    Reflux = require('reflux'),
    I18n = require('i18n'),
    ViewBoxHeader = require('ViewBoxHeader'),
    GTable = require('grommet/components/Table'),
    LagActions = require('LagActions'),
    LagStore = require('LagStore'),
    ViewInitMixin = require('ViewInitMixin');

function t(key) {
    return I18n.text('views.lag.' + key);
}

module.exports = React.createClass({

    displayName: 'LagView',

    mixins: [
        Reflux.connect(LagStore),
        ViewInitMixin
    ],

    getInitialState: function() {
        return { sel: null };
    },

    componentDidMount: function() {
        LagActions.loadLags();
    },

    mkLinkAggrTitle: function() {
        var sysId = this.state.config.sysId,
            sysPri = this.state.config.sysPri;
        return (
            <div>
                {t('linkAggrGroups')}&nbsp;&nbsp;&nbsp;
                { ( sysId && sysPri ) ?
                    <small>(
                        {t('sysId') + ': ' + this.state.config.sysId}
                        &nbsp;-&nbsp;
                        {t('sysPri') + ': ' + this.state.config.sysPri}
                    )</small>
                    : null }
            </div>
        );
    },

    mkInfsTitle: function() {
        if (this.state.loadedLag) {
            return t('infs');
        }
        return <div>{t('infs')}&nbsp;<small>{t('infsNoneLoaded')}</small></div>;
    },

    selectLag: function(selection) {
        var sel = this.state.lags[selection];
        if (sel) {
            this.setState({
                sel: selection
            });
            LagActions.loadInterfaces(sel);
        } else {
            this.setState({
                sel: null
            });
        }
    },

    mkActorPartnerPropTable: function(actorOrPartner, intf) {
        return (
            <table className="actorPartnerProps">
                <tbody>
                    <tr>
                        <td>{t('key')}:</td>
                        <td>{intf[actorOrPartner + 'Key']}</td>
                    </tr>
                    <tr>
                        <td>{t('state')}:</td>
                        <td>{intf[actorOrPartner + 'State']}</td>
                    </tr>
                    <tr>
                        <td>{t('portId')}:</td>
                        <td>{intf[actorOrPartner + 'PortId']}</td>
                    </tr>
                    <tr>
                        <td>{t('sysId')}:</td>
                        <td>{intf[actorOrPartner + 'SysId']}</td>
                    </tr>
                </tbody>
            </table>
        );
    },

    render: function() {
        var lags,
            infs,
            initSel = this.state.sel !== null ? [this.state.sel] : null;

        lags = this.state.lags.map(function(i) {
            return (
                <tr key={i.name}>
                    <td>{i.name}</td>
                    <td>{i.mode}</td>
                    <td>{i.bondStatus}</td>
                    <td>{i.bondStatusReason}</td>
                    <td>{i.bondSpeed}</td>
                </tr>
            );
        });

        infs = this.state.infs.map(function(i) {
            return (
                <tr key={i.name}>
                    <td>{i.name}</td>
                    <td>{i.lacpCurrent}</td>
                    <td title={t('actorPartnerTooltip')}>
                        {this.mkActorPartnerPropTable('actor', i)}
                    </td>
                    <td title={t('actorPartnerTooltip')}>
                        {this.mkActorPartnerPropTable('partner', i)}
                    </td>
                </tr>
            );
        }.bind(this));

        return (
            <div id='lagView' className="viewCol">

                <div className="viewBox">
                    <ViewBoxHeader title={this.mkLinkAggrTitle()} />
                    <div className="viewBoxContent">
                        <GTable className="defaultTable"
                            selectable={true}
                            selection={initSel}
                            onSelect={this.selectLag}>
                            <thead>
                                <th>{t('lagName')}</th>
                                <th>{t('mode')}</th>
                                <th>{t('bondStatus')}</th>
                                <th>{t('bondStatusReason')}</th>
                                <th>{t('bondSpeed')}</th>
                            </thead>
                            <tbody>
                                {lags}
                            </tbody>
                        </GTable>
                    </div>
                </div>

                <div className="viewBox">
                    <ViewBoxHeader title={this.mkInfsTitle()} />
                    <div className="viewBoxContent">
                        <GTable className="defaultTable">
                            <thead>
                                <th>{t('infName')}</th>
                                <th>{t('lacpCurrent')}</th>
                                <th>{t('actor')}</th>
                                <th>{t('partner')}</th>
                            </thead>
                            <tbody>
                                {infs}
                            </tbody>
                        </GTable>
                    </div>
                </div>


            </div>
        );
    }

});
