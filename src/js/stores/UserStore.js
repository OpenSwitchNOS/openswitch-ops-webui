/*
 * The store for users.
 * @author Frank Wood
 */

var Reflux = require('reflux');

module.exports = Reflux.createStore({

    // Data model.
    state: {
        name: 'Kaitlyn Bristowe'
    },

    // Can be used to initialize users of this store.
    getInitialState: function() {
        return this.state;
    }

});
