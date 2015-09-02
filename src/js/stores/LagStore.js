/*
 * LAG store.
 * @author Frank Wood
 */

var Reflux = require('reflux'),
    LagActions = require('LagActions');

module.exports = Reflux.createStore({

    listenables: [ LagActions ],

    state: {
        config: {},
        lags: [],
        loadedLag: null,
        infs: [],
    },

    getInitialState: function() {
        return this.state;
    },

    onLoadLagsCompleted: function(data) {
        this.state.lags = data.lags;
        this.state.config = data.config;
        this.trigger(this.state);
    },

    onLoadInterfacesCompleted: function(lag, infs) {
        this.state.loadedLag = lag;
        this.state.infs = infs;
        this.trigger(this.state);
    }

});
