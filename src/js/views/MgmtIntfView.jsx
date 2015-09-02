/*
 * Management Interface store.
 * @author Al Harrington
 * @author Frank Wood
 */

var React = require('react'),
    Reflux = require('reflux'),
    I18n = require('i18n'),
    ViewBoxHeader = require('ViewBoxHeader'),
    MgmtIntfActions = require('MgmtIntfActions'),
    MgmtIntfStore = require('MgmtIntfStore'),
    PropTable = require('PropTable');

function t(key) {
    return I18n.text('views.mgmtIntf.' + key);
}

module.exports = React.createClass({

    displayName: 'MgmtIntfView',

    mixins: [ Reflux.connect(MgmtIntfStore) ],

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
                        className="viewBoxContent"
                        data={this.mkPropData()} />
                </div>

            </div>
        );
    }

});
