/*
 * Login component.
 * @author Kelsey Dedoshka
 * @author Frank Wood
 */

var React = require('react/addons'),
    Reflux = require('reflux'),
    Router = require('react-router'),
    SessionStore = require('SessionStore'),
    SessionActions = require('SessionActions'),
    History = Router.History,
    Navigation = Router.Navigation,
    GLayer = require('grommet/components/Layer'),
    GLoginForm = require('grommet/components/LoginForm'),
    I18n = require('i18n'),
    ViewInitMixin = require('ViewInitMixin'),
    ClassNames = require('classnames');

module.exports = React.createClass({

    displayName: 'Login',

    mixins: [
        History,
        Navigation,
        Reflux.listenTo(SessionStore, 'onSessionChange'),
        ViewInitMixin
    ],

    getInitialState: function() {
        return { inProgress: false, errors: [ ] };
    },

    onSessionChange: function(data) {
        if (this.state.inProgress) {
            this.setState({
                inProgress: false,
                errors: data.userId ? [ ] : [ I18n.text('invalidUserPwd') ]
            });
            if (data.userId) {
                this.context.router.replaceWith('/dashboard');
            }
        }
    },

    onSubmitLogin: function(data) {
        SessionActions.open({
            user: data.username,
            pwd: data.password
        });
        this.setState(({
            inProgress: true,
            errors: [ ]
        }));
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
