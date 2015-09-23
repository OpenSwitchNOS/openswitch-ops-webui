/*
 (C) Copyright 2015 Hewlett Packard Enterprise Development LP

    Licensed under the Apache License, Version 2.0 (the "License"); you may
    not use this file except in compliance with the License. You may obtain
    a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
    License for the specific language governing permissions and limitations
    under the License.
*/

/*
 * Login component.
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
