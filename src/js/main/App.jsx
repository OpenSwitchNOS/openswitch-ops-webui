/*
 * Top-level component that creates the appliction.
 * @author Kelsey Dedoshka
 * @author Frank Wood
 */

var React = require('react/addons'),
    ReactCSSTransitionGroup = React.addons.CSSTransitionGroup,
    Router = require('react-router'),
    RouteHandler = Router.RouteHandler,
    Reflux = require('reflux'),
    RenderStore = require('RenderStore'),
    Mast = require('Mast'),
    NavPane = require('NavPane'),
    ClassNames = require('classnames'),
    Notification = require('Notification'),
    QueryString = require('query-string'),
    RestUtils = require('restUtils');

var MAX_AUTO_CLOSE_NAV_WIDTH = 640;

module.exports = React.createClass({

    displayName: 'App',

    mixins: [
        Reflux.connect(RenderStore, 'render'),
        Router.State
    ],

    componentWillMount: function() {
        var qs = QueryString.parse(location.search);
        if (qs && qs.restapi) {
            RestUtils.setRestApiRedirect(qs.restapi);
        }
        this.updateDimensions();
    },

    componentDidMount: function() {
        window.addEventListener('resize', this.updateDimensions);
    },

    componentWillUnmount: function() {
        window.removeEventListener('resize', this.updateDimensions);
    },

    shouldAutoCloseNavPane: function() {
        // TODO: works but first click on resize small - not auto close?
        return window.innerWidth <= MAX_AUTO_CLOSE_NAV_WIDTH;
    },

    updateDimensions: function() {
        this.setState({
            width: window.innerWidth, height: window.innerHeight
        });
    },

    render: function() {

        var showNav = this.state.render.showNavPane,
            err = this.state.render.requestErr,
            cls = ClassNames({ navPaneShown: showNav });

        return (
            <div>
                <Mast />

                <ReactCSSTransitionGroup transitionName="navPaneTrans">
                    {showNav ?
                        <NavPane autoClose={this.shouldAutoCloseNavPane()}/> :
                        null}
                </ReactCSSTransitionGroup>

                <div id="viewPane" className={cls}>
                    <RouteHandler />
                </div>

                {err ? <Notification requestErr={err} /> : null}
            </div>
        );
    }
});
