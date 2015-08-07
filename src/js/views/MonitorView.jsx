/*
 * Monitor view.
 * @author Frank Wood
 */

var React = require('react'),
    I18n = require('i18n');

module.exports = React.createClass({

    displayName: 'MonitorView',

    render: function() {
        var t = I18n.text;
        return (
            <div>
                <h1>{t('views.monitor.name')}</h1>
            </div>
        );
    }

});
