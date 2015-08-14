/*
 * System monitor view.
 * @author Frank Wood
 */

var React = require('react'),
    I18n = require('i18n');

module.exports = React.createClass({

    displayName: 'SystemMonitor',

    render: function() {
        var t = I18n.text;
        return (
            <div>
                <h1>{t('views.systemMonitor.name')}</h1>
            </div>
        );
    }

});
