/*
 * Port management view.
 * @author Frank Wood
 */

var React = require('react'),
    I18n = require('i18n');

module.exports = React.createClass({

    displayName: 'PortMgmtView',

    render: function() {
        var t = I18n.text;
        return (
            <div>
                <h1>{t('views.portMgmt.name')}</h1>
            </div>
        );
    }

});
