/*
 * Mixin that provides a hook before a routing transition is performed.
 * This will likely be changed after we upgrade to react-router v1.0.
 * @author Frank Wood
 */

var SessionStore = require('SessionStore'),
    SessionActions = require('SessionActions');

module.exports = {
    statics: {

        willTransitionTo: function(transition) {

            console.log('*** ViewInitMixin ***');
            console.log(transition);
            console.log('SessionStore.userId: ' + SessionStore.userId());

            if (transition.path === '/login') {

                SessionActions.close();

            } else if (!SessionStore.userId()) {

                transition.redirect('/login', {}, {});
            }
        }
    }
};
