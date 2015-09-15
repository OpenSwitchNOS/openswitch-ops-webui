/*
 * Mixin that provides a hook before a routing transition is performed.
 * This will likely be changed after we upgrade to react-router v1.0.
 * @author Frank Wood
 */

var AuthStore = require('AuthStore'),
    AuthActions = require('AuthActions'),
    ServerConfigActions = require('ServerConfigActions'),
    ServerConfigStore = require('ServerConfigStore');

module.exports = {
    statics: {

        willTransitionTo: function(transition) {

            console.log('*** ViewInitMixin ***');
            console.log(transition);
            console.log('isLoggedIn: ' + AuthStore.isLoggedIn());
            console.log('isInitialized: ' + ServerConfigStore.isInitialized());

            if (transition.path === '/login') {

                if (AuthStore.isLoggedIn()) {
                    console.log('Performing logout & server reset');
                    AuthActions.logout();
                    ServerConfigActions.reset();
                }

            } else if (!AuthStore.isLoggedIn()) {

                transition.redirect('/login', {}, {});
            }
        }
    }
};
