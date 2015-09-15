/*
 * Actions for authorization/authentication.
 * @author Frank Wood
 */

var Reflux = require('reflux'),
    RestUtils = require('restUtils'),
    AuthActions = require('AuthActions'),
    CookieUtils = require('cookieUtils');

var AuthActions = Reflux.createActions({
    login: { asyncResult: true },
    logout: { }
});

AuthActions.login.listen(function(data) {

    console.log('AuthActions.login.listen');
    console.log(data);
    console.log('Cookie user=' + CookieUtils.get('user'));

    RestUtils.post('/login', {
        username: data.user,
        password: data.pwd
    }, function(e) {
        if (e) {
            this.failed(e);
        } else {
            this.completed({ user: data.user });
            // if (CookieUtils.get('user')) {
            //     this.completed({ user: data.user });
            // } else {
            //     this.failed();
            // }
        }
    }.bind(this),
    'application/x-www-form-urlencoded');
});

AuthActions.logout.listen(function() {
    console.log('AuthActions.logout.listen');
    console.log('Cookie user=' + CookieUtils.get('user'));
});

module.exports = AuthActions;
