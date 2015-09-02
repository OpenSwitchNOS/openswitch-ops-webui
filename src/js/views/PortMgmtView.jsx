/*
 * Ports Mgmt view.
 * @author Kelsey Dedoshka
 */

var React = require('react'),
    Reflux = require('reflux'),
    I18n = require('i18n'),
    PropTypes = React.PropTypes,
    Cnvs = require('conversions'),
    PortsMgmtActions = require('PortsMgmtActions'),
    PortsMgmtStore = require('PortsMgmtStore'),
    BoxGraphic = require('BoxGraphic'),
    ViewBoxHeader = require('ViewBoxHeader'),
    GTable = require('grommet/components/Table');

// internationalization for the view
function t(key) {
    return I18n.text('views.portMgmt.' + key);
}

// internationalization for units
function tUnits(key) {
    return I18n.text('units.' + key);
}

var PortList = React.createClass({

    displayName: 'PortList',

    propTypes: {
        ports: PropTypes.array
    },

    render: function() {

        return (
            <GTable className="defaultTable portTable">
                <thead>
                    <th>{t('th.name')}</th>
                    <th>{t('th.adminState')}</th>
                    <th>{t('th.linkState')}</th>
                    <th>{t('th.duplex')}</th>
                    <th>{t('th.speed')}</th>
                    <th>{t('th.connector')}</th>
                    <th>{t('th.vendor')}</th>
                </thead>
                <tbody>
                    {this.props.ports.map(function(port) {
                        return (
                            <tr key={port.data.name}>
                                <td>{port.data.name}</td>
                                <td>{port.data.admin_state}</td>
                                <td>{port.data.link_state}</td>
                                <td>{port.data.duplex}</td>
                                <td>{Cnvs.bpsToGbps(port.data.link_speed)
                                        + tUnits('gbps')}
                                </td>
                                <td>{port.data.pm_info.connector}</td>
                                <td>{port.data.pm_info.vendor_name}</td>
                            </tr>
                        );
                    }, this)}
                </tbody>
            </GTable>
        );
    }
});

var KeyItem = React.createClass({

    displayName: 'KeyItem',

    propTypes: {
        cls: PropTypes.string,
        title: PropTypes.string,
        icon: PropTypes.string
    },

    render: function() {
        return (
            <div className={'portStatusKey ' + this.props.cls}>
                <span className={'ports ' + this.props.cls}>
                    {this.props.icon ?
                        <i className = {'fa fa-' +this.props.icon}></i>
                        : null}
                </span>
                <span className="keyTitle">{this.props.title}</span>
            </div>
        );
    }
});

module.exports = React.createClass({

    displayName: 'PortsMgmtView',

    mixins: [ Reflux.connect(PortsMgmtStore, 'data') ],

    componentDidMount: function() {
        PortsMgmtActions.loadPorts();
    },

    render: function() {

        var toolbar = {
            active: <KeyItem cls='up' title='Up' icon='check'/>,
            adminDisabled: <KeyItem cls='adminDisabled' title='Admin Disabled'
                icon='times'/>,
            linkDisabled: <KeyItem cls='linkDisabled' title='Link Disabled'
                icon='times'/>,
        };

        return (
            <div id="portsMgmtView" className="viewFill viewCol">
                <div className="viewBox viewFlex0">
                    <ViewBoxHeader
                        title={t('boxGraphic')}
                        toolbar={toolbar} />
                    <BoxGraphic portConfig = {{
                        'showPortStatus': true,
                        'config': this.state.data.portStatus }}/>
                </div>
                <div className="viewBox viewFlex0">
                    <ViewBoxHeader title={t('allInterfaces')}/>
                    <PortList ports={this.state.data.allPorts}/>
                </div>
            </div>
        );
    }

});
