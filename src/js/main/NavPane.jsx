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
            to: PropTypes.string.isRequired,
            name: PropTypes.string
        })).isRequired
    },

    mixins: [ Reflux.connect(RenderStore, 'render') ],

    onClickLink: function() {
        if (this.props.autoClose) {
            RenderActions.hideNavPane();
        }
    },

    render: function() {
        var t = I18n.text,
            clickFn = this.onClickLink,
            heading = this.props.heading,
            hd = heading ? <div className="heading">{heading}</div> : null;

        return (
            <div className="group">
                {hd}
                <ul>
                    { this.props.routes.map(function(route) {
                        var to = route.to,
                            nameKey = route.viewName || to,
                            name = t('views.' + nameKey + '.name');
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
                        { to: 'mgmtIntf' },
                    ]}
                />
                <hr />
                <NavGroup autoClose={ac} heading={t('ports')}
                    routes={[
                        { to: 'portMgmt' },
                        { to: 'portMonitor' },
                        { to: 'lag' }
                    ]}
                />
                <hr />
                <NavGroup autoClose={ac} heading={t('vlans')}
                    routes={[
                        { to: 'vlanMgmt' },
                        { to: 'vlanPortConfig' }
                    ]}
                />

            </div>
        );
    }
});
