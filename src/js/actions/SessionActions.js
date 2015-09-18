/*
 * Actions for a session.
 * @author Frank Wood
 */

var Reflux = require('reflux'),
    RestUtils = require('restUtils'),
    I18n = require('i18n');

var SessionActions = Reflux.createActions({
    open: { asyncResult: true },
    close: { }
});

function configSystem(parent, user, sysRes) {
    var cfg = sysRes.body.configuration;

    // overwrite any configuration we require.
    cfg.other_config['enable-statistics'] = 'true';

    RestUtils.put('/rest/v1/system', { configuration: cfg }, function(e) {
        if (e) {
            parent.failed(e); // failed PUT - DONE
        } else {
            parent.completed(user); // DONE
        }
    });
}

function isSystemReady(r) {
    var cfg = r.body.configuration;
    return cfg.other_config && cfg.other_config['enable-statistics'];
}

function readySystem(parent, user, sysRes) {
    if (sysRes) {
        if (isSystemReady(sysRes)) {
            parent.completed(user); // DONE
        } else {
            configSystem(parent, user, sysRes);
        }
    } else {
        RestUtils.get('/rest/v1/system', function(e, r) {
            if (e) {
                parent.failed(e); // failed GET - DONE
            } else {
                configSystem(parent, user, r);
            }
        });
    }
}

function authenticate(parent, user, pwd) {
    var body = { username: user, password: pwd };
    RestUtils.post('/login', body, function(e) {
        if (e) {
            parent.failed(e); // failed POST - DONE
        } else {
            readySystem(parent, user);
        }
    },
    'application/x-www-form-urlencoded');
}

function openSession(parent, user, pwd) {
    RestUtils.get('/rest/v1/system', function(e, r) {
        if (e) {
            if (e.response.unauthorized) {
                authenticate(parent, user, pwd);
            } else {
                parent.failed(e); // failed GET and not unauthorized - DONE
            }
        } else {
            readySystem(parent, I18n.text('noAuthUserId'), r);
        }
    });
}

SessionActions.open.listen(function(data) {
    openSession(this, data.user, data.pwd);
});

module.exports = SessionActions;
