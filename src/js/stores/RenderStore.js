/*
 * The store for the render configuration.
 * @author Frank Wood
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
        screenType: 'normal',
        showNavPane: true,
        autoCloseNavPane: false,
        isAuth: false,
        requestErr: null
    },

    // Can be used to initialize users of this store.
    getInitialState: function() {
        return this.state;
    },

    // Callback for RenderActions.smallScreen.
    onSmallScreen: function() {
        this.state.screenType = 'small';
        this.trigger(this.state);
    },

    // Callback for RenderActions.normalScreen.
    onNormalScreen: function() {
        this.state.screenType = 'normal';
        this.trigger(this.state);
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

    onLogin: function() {
        this.state.isAuth = true;
        this.trigger(this.state);
    },

    onPostRequestErr: function(err) {
        this.state.requestErr = err;
        this.trigger(this.state);
    },

    onClearRequestErr: function() {
        this.state.requestErr = null;
        this.trigger(this.state);
    }

});
