/*
 * Navigation pane that creates one or more navigation groups.
 * @author Kelsey Dedoshka
 * @author Frank Wood
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
        heading: PropTypes.string,
        routes: PropTypes.arrayOf(PropTypes.string).isRequired
    },

    mixins: [ Reflux.connect(RenderStore, 'render') ],

    onClickLink: function() {
        if (this.state.autoCloseNavPane) {
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
                        var name = t('views.' + route + '.name');
                        return (
                            <li key={name}>
                                <Link onClick={clickFn} to={route}>{name}</Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    }
});

module.exports = React.createClass({

    displayName: 'NavPane',

    render: function() {
        var t = I18n.text;
        return (
            <div id="navPane">

                <NavGroup heading={t('general')}
                    routes={[
                        'dashboard'
                    ]}
                />
                <hr />
                <NavGroup heading={t('ports')}
                    routes={[
                        'portMonitor',
                        'portConfig'
                    ]}
                />
                <NavGroup heading={t('vlans')}
                    routes={[
                        'vlans'
                    ]}
                />
                <hr />
                <NavGroup heading={t('monitor')}
                    routes={[
                        'monitor'
                    ]}
                />
                <hr />
                <NavGroup heading={t('routing')}
                    routes={[
                        'test1',
                        'test2',
                        'test3'
                    ]}
                />

            </div>
        );
    }
});
