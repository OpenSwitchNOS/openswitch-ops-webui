/*
 * Session store.
 * @author Frank Wood
 */

var Reflux = require('reflux'),
    SessionActions = require('SessionActions'),
    CookieUtils = require('cookieUtils');

module.exports = Reflux.createStore({

    listenables: [ SessionActions ],

    getInitialState: function() {
        return { userId: sessionStorage.userId };
    },

    userId: function() {
        return sessionStorage.userId;
    },

    onClose: function() {
        delete sessionStorage.userId;
        CookieUtils.delete('user');
        this.trigger({ userId: null });
    },

    onOpenCompleted: function(userId) {
        sessionStorage.userId = userId;
        this.trigger({ userId: sessionStorage.userId });
    },

    onOpenFailed: function() {
        delete sessionStorage.userId;
        CookieUtils.delete('user');
        this.trigger({ userId: null });
    }

});
