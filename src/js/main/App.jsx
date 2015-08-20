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
    Notification = require('Notification');

module.exports = React.createClass({

    displayName: 'App',

    mixins: [
        Reflux.connect(RenderStore, 'render')
    ],

    render: function() {

        var showNav = this.state.render.showNavPane,
            err = this.state.render.requestErr,
            cls = ClassNames({ navPaneShown: showNav });

        console.log(err);

        return (
            <div>
                <Mast />

                <ReactCSSTransitionGroup transitionName="navPaneTrans">
                    {showNav ? <NavPane /> : null}
                </ReactCSSTransitionGroup>

                <div id="viewPane" className={cls}>
                    <RouteHandler />
                </div>

                {err ? <Notification requestErr={err} /> : null}
            </div>
        );
    }
});
