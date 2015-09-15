/*
 * Authentication/Authorization store.
 * @author Frank Wood
 */

var Reflux = require('reflux'),
    AuthActions = require('AuthActions'),
    CookieUtils = require('cookieUtils');

module.exports = Reflux.createStore({

    listenables: [ AuthActions ],

    getInitialState: function() {
        return { user: localStorage.user, error: false };
    },

    isLoggedIn: function() {
        return !!localStorage.user;
    },

    onLogin: function() {
        delete localStorage.user;
        CookieUtils.delete('user');
    },

    onLoginCompleted: function(data) {
        localStorage.user = data.user;
        this.trigger({ user: localStorage.user, error: false });
    },

    onLoginFailed: function() {
        delete localStorage.user;
        CookieUtils.delete('user');
        this.trigger({ user: null, error: true });
    },

    onLogout: function() {
        delete localStorage.user;
        CookieUtils.delete('user');
        this.trigger({ user: null, error: false });
    }

});
