/*
 * Login component.
 * @author Kelsey Dedoshka
 * @author Frank Wood
 */

var React = require('react/addons'),
    Reflux = require('reflux'),
    Router = require('react-router'),
    AuthStore = require('AuthStore'),
    ServerConfigStore = require('ServerConfigStore'),
    History = Router.History,
    Navigation = Router.Navigation,
    GLayer = require('grommet/components/Layer'),
    GLoginForm = require('grommet/components/LoginForm'),
    AuthActions = require('AuthActions'),
    ServerConfigActions = require('ServerConfigActions'),
    I18n = require('i18n'),
    ViewInitMixin = require('ViewInitMixin'),
    ClassNames = require('classnames');

module.exports = React.createClass({

    displayName: 'Login',

    mixins: [
        History,
        Navigation,
        Reflux.listenTo(AuthStore, 'onAuthChange'),
        Reflux.listenTo(ServerConfigStore, 'onServerConfigChange'),
        ViewInitMixin
    ],

    getInitialState: function() {
        return { inProgress: false, errors: [ ] };
    },

    onAuthChange: function(data) {
        if (data.error) {
            this.setState({
                inProgress: false,
                errors: [ I18n.text('invalidUserPwd') ]
            });
        } else {
            this.setState({
                inProgress: false,
                errors: [ ]
            });
        }

        if (data.user) {
            ServerConfigActions.init();
        }
    },

    onServerConfigChange: function(data) {
        var ctxRtr = this.context.router,
            cq = ctxRtr && ctxRtr.getCurrentQuery();
        if (data.isInitialized) {
            if (cq && cq.nextPath) {
                ctxRtr.replaceWith(cq.nextPath);
            } else {
                ctxRtr.replaceWith('/dashboard');
            }
        }
    },

    onSubmitLogin: function(data) {
        AuthActions.login({
            user: data.username,
            pwd: data.password
        });
        this.setState(({ inProgress: true, errors: [ ] }));
    },

    render: function() {
        var cls = ClassNames(
                'appLoginLayer',
                { progress: this.state.inProgress }
            );

        return (
            <GLayer className={cls}>
                <div id="appLoginForm">
                    <GLoginForm
                        logo=<img src="OpenSwitchLogo.png" />
                        onSubmit={this.onSubmitLogin}
                        errors={this.state.errors}
                    />
                </div>
            </GLayer>
        );
    }

});
