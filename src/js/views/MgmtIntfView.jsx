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
 * Management Interface store.
 */

var React = require('react'),
    Reflux = require('reflux'),
    I18n = require('i18n'),
    ViewBoxHeader = require('ViewBoxHeader'),
    MgmtIntfActions = require('MgmtIntfActions'),
    MgmtIntfStore = require('MgmtIntfStore'),
    PropTable = require('PropTable'),
    ViewInitMixin = require('ViewInitMixin');

function t(key) {
    return I18n.text('views.mgmtIntf.' + key);
}

module.exports = React.createClass({

    displayName: 'MgmtIntfView',

    mixins: [
        Reflux.connect(MgmtIntfStore),
        ViewInitMixin,
    ],

    componentDidMount: function() {
        MgmtIntfActions.load();
    },

    mkPropData: function() {
        var si = this.state,
            result = [];
        result.push([ t('intfName'), si.name ]);
        if (si.mode) {
            result.push([ t('mode'), si.mode ]);
            if (si.mode === 'static') {
                if ( si.ip ) {
                    result.push([ t('ip'), si.ip ]);
                }
                if ( si.subnetMask ) {
                    result.push([ t('subnetMask'), si.subnetMask ]);
                }
                if ( si.defaultGateway ) {
                    result.push([ t('defaultGateway'), si.defaultGateway ]);
                }
                if ( si.ipv6 ) {
                    result.push([ t('ipv6'), si.ipv6 ]);
                }
                if ( si.dnsServer1 ) {
                    result.push([ t('dnsServer1'), si.dnsServer1 ]);
                }
                if ( si.dnsServer2 ) {
                    result.push([ t('dnsServer2'), si.dnsServer2 ]);
                }
            } else {
                result.push([ t('mode'), t('modeDHCP') ]);
            }
        } else {
            result.push([ t('mode'), t('modeDHCP') ]);
        }
        return result;
    },

    render: function() {
        return (
            <div className="viewFill viewCol">

                <div className="viewBox">
                    <ViewBoxHeader title={t('mgmtIntf')} />
                    <PropTable
                        className="viewBoxContent margin"
                        data={this.mkPropData()} />
                </div>

            </div>
        );
    }

});
