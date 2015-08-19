/*
 * Top-level component that creates the appliction.
 * @author Kelsey Dedoshka
 * @author Frank Wood
 */

var React = require('react/addons'),
    Reflux = require('reflux'),
    RenderActions = require('RenderActions'),
    RenderStore = require('RenderStore'),
    GLayer = require('grommet/components/Layer'),
    GLoginForm = require('grommet/components/LoginForm'),
    Navigation = require('react-router').Navigation;

module.exports = React.createClass({

    displayName: 'Login',

    // FIXME: may want to have a different "login" action.
    mixins: [
        Reflux.listenTo(RenderStore, 'onRenderStoreChanged'),
        Navigation
    ],

    onRenderStoreChanged: function(renderStoreState) {
        if (renderStoreState.isAuth) {
            this.transitionTo('dashboard');
        }
    },

    render: function() {
        return (
            <GLayer className="appLoginLayer">
                <div id="appLoginForm">
                    <GLoginForm
                        logo=<img src="OpenSwitchLogo.png" />
                        onSubmit={RenderActions.login}
                    />
                </div>
            </GLayer>
        );
    }
});
