/*
 * Ports view.
 * @author Frank Wood
 */

var React = require('react'),
    I18n = require('i18n');

module.exports = React.createClass({

    displayName: 'PortsView',

    render: function() {
        var t = I18n.text;
        return (
            <div>
                <h1>{t('views.ports.name')}</h1>
            </div>
        );
    }

});
