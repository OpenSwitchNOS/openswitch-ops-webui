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
        this.state.lags = data.lags.sort(function(l1, l2) {
            return (l1.name > l2.name) ? 1 : ((l2.name > l1.name) ? -1 : 0);
        });
        this.state.config = data.config;
        this.trigger(this.state);
    },

    onLoadInterfacesCompleted: function(lag, infs) {
        this.state.loadedLag = lag;
        this.state.infs = infs.sort(function(i1, i2) {
            return (i1.name > i2.name) ? 1 : ((i2.name > i1.name) ? -1 : 0);
        });
        this.trigger(this.state);
    }

});
