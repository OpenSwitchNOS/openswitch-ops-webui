/*
 * Navigation pane that creates one or more navigation groups.
 * @author Kelsey Dedoshka
 * @author Frank Wood
 * @author Al Harrington
 */

var React = require('react/addons'),
    I18n = require('i18n'),
    PropTypes = React.PropTypes,
    Router = require('react-router'),
    Link = Router.Link,
    Reflux = require('reflux'),
    RenderActions = require('RenderActions'),
    RenderStore = require('RenderStore');

var NavGroup = React.createClass({

    displayName: 'NavGroup',

    propTypes: {
        autoClose: PropTypes.bool,
        heading: PropTypes.string,
        routes: PropTypes.arrayOf(PropTypes.shape({
            to: PropTypes.string,
            nameKey: PropTypes.string,
            href: PropTypes.string
        })).isRequired
    },

    mixins: [ Reflux.connect(RenderStore, 'render') ],

    checkAutoCloseNavPane: function() {
        if (this.props.autoClose) {
            RenderActions.hideNavPane();
        }
    },

    render: function() {
        var t = I18n.text,
            clickFn = this.checkAutoCloseNavPane,
            heading = this.props.heading,
            hd = heading ? <div className="heading">{heading}</div> : null;

        return (
            <div className="group headerFont">
                {hd}
                <ul>
                    { this.props.routes.map(function(route) {
                        var to = route.to,
                            href = route.href,
                            name = route.nameKey ?
                                t(route.nameKey) :
                                t('views.' + to + '.name');
                        if (href) {
                            return (
                                <li key={name}>
                                    <a href={href} target="_blank">
                                        {name}
                                    </a>
                                </li>
                            );
                        }
                        return (
                            <li key={name}>
                                <Link onClick={clickFn} to={to}>{name}</Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    }
});

// FIXME: not highlighting when systemMonitor/memory (ActiveStore or query params)

module.exports = React.createClass({

    displayName: 'NavPane',

    propTypes: {
        autoClose: PropTypes.bool,
    },

    render: function() {
        var t = I18n.text,
            ac = this.props.autoClose;
        return (
            <div id="navPane">

                <NavGroup autoClose={ac} heading={t('general')}
                    routes={[
                        { to: 'dashboard' },
                        { to: 'systemMonitor' },
                        { to: 'mgmtIntf' }
                    ]}
                />
                <hr />
                <NavGroup autoClose={ac} heading={t('interfaces')}
                    routes={[
                        { to: 'portMgmt' },
                        { to: 'portMonitor' },
                        { to: 'lag' }
                    ]}
                />
                <hr />
                <NavGroup autoClose={ac} heading={t('vlans')}
                    routes={[
                        { to: 'vlanMgmt' }
                    ]}
                />
                <hr />
                <NavGroup autoClose={ac} heading={t('links')}
                    routes={[
                        {
                            href: 'http://api.openswitch.net/rest/dist/index.html',
                            nameKey: 'swaggerLink'
                        },
                        {
                            href: 'http://openswitch.net',
                            nameKey: 'openSwitchLink'
                        }
                    ]}
                />

            </div>
        );
    }
});
