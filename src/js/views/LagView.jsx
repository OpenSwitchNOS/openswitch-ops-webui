/*
 * LAG view.
 * @author Frank Wood
 */

var React = require('react'),
    Reflux = require('reflux'),
    I18n = require('i18n'),
    ViewBoxHeader = require('ViewBoxHeader'),
    GTable = require('grommet/components/Table'),
    LagActions = require('LagActions'),
    LagStore = require('LagStore');

function t(key) {
    return I18n.text('views.lag.' + key);
}

module.exports = React.createClass({

    displayName: 'LagView',

    mixins: [ Reflux.connect(LagStore) ],

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
            LagActions.loadInterfaces(sel);
        }
    },

    render: function() {
        var lags,
            infs;

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
                    <td>{i.mac}</td>
                    <td>{i.macInUse}</td>
                    <td>{i.lacpCurrent}</td>
                    <td>{i.actorKey}</td>
                    <td>{i.actorState}</td>
                    <td>{i.actorPortId}</td>
                    <td>{i.actorSysId}</td>
                    <td>{i.partnerKey}</td>
                    <td>{i.partnerState}</td>
                    <td>{i.partnerPortId}</td>
                    <td>{i.partnerSysId}</td>
                </tr>
            );
        });

        return (
            <div className="viewFill viewCol">

                <div className="viewBox viewFlex1">
                    <ViewBoxHeader title={this.mkLinkAggrTitle()} />
                    <GTable className="defaultTable"
                        selectable={true}
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

                <div className="viewBox viewFlex1">
                    <ViewBoxHeader title={this.mkInfsTitle()} />
                    <GTable className="defaultTable">
                        <thead>
                            <th>{t('infName')}</th>
                            <th>{t('mac')}</th>
                            <th>{t('macInUse')}</th>
                            <th>{t('lacpCurrent')}</th>
                            <th>{t('actorKey')}</th>
                            <th>{t('actorState')}</th>
                            <th>{t('actorPortId')}</th>
                            <th>{t('actorSysId')}</th>
                            <th>{t('partnerKey')}</th>
                            <th>{t('partnerState')}</th>
                            <th>{t('partnerPortId')}</th>
                            <th>{t('partnerSysId')}</th>
                        </thead>
                        <tbody>
                            {infs}
                        </tbody>
                    </GTable>
                </div>

            </div>
        );
    }

});
