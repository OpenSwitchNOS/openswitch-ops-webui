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
 * Session store.
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
