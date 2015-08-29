/*
 * System monitor view.
 * @author Frank Wood
 */

var React = require('react'),
    I18n = require('i18n'),
    ViewBoxHeader = require('ViewBoxHeader'),
    GMenu = require('grommet/components/Menu'),
    Router = require('react-router'),
    RouteHandler = Router.RouteHandler,
    Link = Router.Link;

function t(key) {
    return I18n.text('views.systemMonitor.' + key);
}

module.exports = React.createClass({

    displayName: 'SystemMonitorView',

    mixins: [
        Router.Navigation,
        Router.State
    ],

    componentWillMount: function() {
        if (!this.getParams().type) {
            this.transitionTo('/systemMonitor/cpu');
        }
    },

    mkLink: function(type) {
        return (
            <Link to={'/systemMonitor/' + type}>
                {t(type)}
            </Link>
        );
    },

    render: function() {
        return (
            <div id="systemMonitorView" className="viewFill viewCol">
                <div className="viewRow">
                    <div className="viewBox viewFlex1">
                        <ViewBoxHeader title=
                            <GMenu direction="row">
                                {this.mkLink('cpu')}
                                {this.mkLink('memory')}
                                {this.mkLink('temperature')}
                            </GMenu>
                        />
                        <RouteHandler />
                    </div>
                </div>
            </div>
        );
    }

});
