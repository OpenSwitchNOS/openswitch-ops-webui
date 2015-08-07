/*
 * IP view.
 * @author Frank Wood
 */

var React = require('react'),
    I18n = require('i18n');

module.exports = React.createClass({

    displayName: 'IpView',

    render: function() {
        var t = I18n.text;
        return (
            <div>
                <h1>{t('views.ip.name')}</h1>
            </div>
        );
    }

});
