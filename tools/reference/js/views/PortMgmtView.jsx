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
 * Ports Mgmt view.
 */

var React = require('react'),
    Reflux = require('reflux'),
    I18n = require('i18n'),
    PropTypes = React.PropTypes,
    Cnvs = require('conversions'),
    PortsMgmtStore = require('PortsMgmtStore'),
    BoxGraphic = require('BoxGraphic'),
    ViewBoxHeader = require('ViewBoxHeader'),
    GTable = require('grommet/components/Table'),
    ViewInitMixin = require('ViewInitMixin'),
    PortsActions = require('PortsActions');

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

    mixins: [
        ViewInitMixin
    ],

    componentDidMount: function() {
        PortsActions.loadPorts();
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
                            <tr key={port.name}>
                                <td>{port.name}</td>
                                <td>{port.adminState}</td>
                                <td>{port.linkState}</td>
                                <td>{port.duplex}</td>
                                <td>{Cnvs.bpsToGbps(port.linkSpeed)
                                        + tUnits('gbps')}
                                </td>
                                <td>{port.connector}</td>
                                <td>{port.vendorName}</td>
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
                    <div className="viewBoxContent">
                        <BoxGraphic portConfig = {{
                            'showPortStatus': true,
                            'config': this.state.data.portStatus }}/>
                    </div>
                </div>
                <div className="viewBox viewFlex0">
                    <ViewBoxHeader title={t('allInterfaces')}/>
                    <div className="viewBoxContent scrollbar">
                        <PortList ports={this.state.data.allPorts}/>
                    </div>
                </div>
            </div>
        );
    }

});
