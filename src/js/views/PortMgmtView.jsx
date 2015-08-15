/*
 * Ports Mgmt view.
 * @author Kelsey Dedoshka
 */

var React = require('react'),
    Reflux = require('reflux'),
    I18n = require('i18n'),
    PropTypes = React.PropTypes,
    PortsMgmtActions = require('PortsMgmtActions'),
    PortsMgmtStore = require('PortsMgmtStore'),
    BoxGraphic = require('BoxGraphic'),
    ViewBoxHeader = require('ViewBoxHeader'),
    GTable = require('grommet/components/Table');

function t(key) {
    return I18n.text('views.portMgmt.' + key);
}

var PortList = React.createClass({

    displayName: 'PortList',

    propTypes: {
        ports: PropTypes.object
    },

    render: function() {

        return (
            <GTable className="defaultTable">
                <thead>
                    <th>{t('th.name')}</th>
                    <th>{t('th.adminState')}</th>
                    <th>{t('th.linkState')}</th>
                    <th>{t('th.duplex')}</th>
                    <th>{t('th.speed')}</th>
                    <th>{t('th.connector')}</th>
                </thead>
                <tbody>
                    {this.props.ports.map(function(port) {
                        return (
                            <tr>
                                <td>{port.data.name}</td>
                                <td>{port.data.admin_state}</td>
                                <td>{port.data.link_state}</td>
                                <td>{port.data.duplex}</td>
                                <td>{port.data.link_speed}</td>
                                <td>{port.data.hw_intf_info.connector}</td>
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
            <div className="portStatusKey">
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
            active: <KeyItem cls='active' title='Active' icon='check'/>,
            disabled: <KeyItem cls='disabled' title='Disabled' icon='times'/>,
            port: <KeyItem cls='port' title='Port' />,
            interface: <KeyItem cls='interface' title='Interface'/>
        };

        return (
            <div className="viewFill viewCol">
                <div className="viewBox viewFlex0">
                    <ViewBoxHeader
                        title={t('boxGraphic')}
                        toolbar={toolbar} />
                    <BoxGraphic portConfig = {{
                        'showPortStatus': true,
                        'config': this.state.data.portStatus }}/>
                </div>
                <div className="viewBox viewFlex0">
                    <ViewBoxHeader title={t('allPorts')}/>
                    <PortList ports={this.state.data.allPorts}/>
                </div>
            </div>
        );
    }

});
