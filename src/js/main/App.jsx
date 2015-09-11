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
    RenderActions = require('RenderActions'),
    RenderStore = require('RenderStore'),
    Mast = require('Mast'),
    NavPane = require('NavPane'),
    ClassNames = require('classnames'),
    Notification = require('Notification'),
    QueryString = require('query-string'),
    RestUtils = require('restUtils');

var MAX_AUTO_CLOSE_NAV_WIDTH = 1000;

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

        if (this.shouldAutoCloseNavPane()) {
            RenderActions.hideNavPane();
        }
    },

    componentDidMount: function() {
        window.addEventListener('resize', this.resize);
    },

    componentWillUnmount: function() {
        window.removeEventListener('resize', this.resize);
    },

    resize: function() {
        if (this.shouldAutoCloseNavPane()) {
            RenderActions.hideNavPane();
        }
    },

    shouldAutoCloseNavPane: function() {
        var dim = this.calcDimensions();
        return dim.width <= MAX_AUTO_CLOSE_NAV_WIDTH;
    },

    calcDimensions: function() {
        var ww = window.innerWidth,
            wh = window.innerHeight,
            cw = document.documentElement.clientWidth,
            ch = document.documentElement.clientHeight,
            newWidth, newHeight;

        newWidth = ww && cw ? Math.min(ww, cw) : ww || cw ||
            document.getElementsByTagName('body')[0].clientWidth;

        newHeight = wh && ch ? Math.min(wh, ch) : wh || ch ||
            document.getElementsByTagName('body')[0].clientHeight;

        return { width: newWidth, height: newHeight };
    },

    render: function() {

        var showNav = this.state.render.showNavPane,
            err = this.state.render.requestErr,
            cls = ClassNames({ navPaneShown: showNav }),
            autoClose = this.shouldAutoCloseNavPane();

        return (
            <div>
                <Mast />

                <ReactCSSTransitionGroup transitionName="navPaneTrans">
                    {showNav ?
                        <NavPane autoClose={autoClose} /> : null}
                </ReactCSSTransitionGroup>

                <div id="viewPane" className={cls}>
                    <RouteHandler />
                </div>

                {err ? <Notification requestErr={err} /> : null}
            </div>
        );
    }
});
