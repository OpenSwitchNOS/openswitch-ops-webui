/*
 * Test Store.
 * @author Frank Wood
 */

describe('Test Suite For UserStore', function() {

    var usInit = { name: 'Kaitlyn Bristowe' },
        UserStore;

    beforeEach(function() {
        UserStore = require('UserStore');
    });

    it('correct initial settings', function() {
        expect(UserStore.state).toEqual(usInit);
    });

});
