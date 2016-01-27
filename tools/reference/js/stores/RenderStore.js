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
 * The store for the render configuration.
 */

// TODO: Change name of render store to 'global app store' or something.

var Reflux = require('reflux'),
    RenderActions = require('RenderActions');

// Do all RenderActions have to go through the store?

module.exports = Reflux.createStore({

    // I want callbacks on these actions.
    listenables: [ RenderActions ],

    // Data model.
    state: {
        showNavPane: true,
        requestErr: null,
        restApiRedirect: null
    },

    // Can be used to initialize users of this store.
    getInitialState: function() {
        return this.state;
    },

    // Callback for RenderActions.showNavPane.
    onShowNavPane: function() {
        this.state.showNavPane = true;
        this.trigger(this.state);
    },

    // Callback for RenderActions.hideNavPane.
    onHideNavPane: function() {
        this.state.showNavPane = false;
        this.trigger(this.state);
    },

    // Callback for RenderActions.toggleNavPane.
    onToggleNavPane: function() {
        this.state.showNavPane = !this.state.showNavPane;
        this.trigger(this.state);
    },

    onPostRequestErr: function(err) {
        this.state.requestErr = err;
        this.trigger(this.state);
    },

    onClearRequestErr: function() {
        this.state.requestErr = null;
        this.trigger(this.state);
    },

    onRestApiRedirect: function(host) {
        this.state.restApiRedirect = host;
        this.trigger(this.state);
    }

});
