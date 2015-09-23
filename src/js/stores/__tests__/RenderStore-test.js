/*
 * Test Store.
 * @author Frank Wood
 */

describe('Test Suite For RenderStore', function() {

    var RenderStore,
        RenderActions;

    beforeEach(function() {
        RenderStore = require('RenderStore');
        RenderActions = require('RenderActions');
    });

    it('correct initial settings', function() {
        expect(RenderStore.state.requestErr).toBe(null);
        expect(RenderStore.state.restApiRedirect).toBe(null);
        expect(RenderStore.state.showNavPane).toBe(true);
    });

    it('handles all actions correctly', function() {
        RenderActions.hideNavPane();
        jasmine.clock().tick(); // allow action
        expect(RenderStore.state.showNavPane).toBe(false);

        RenderActions.toggleNavPane();
        jasmine.clock().tick(); // allow action
        expect(RenderStore.state.showNavPane).toBe(true);

        expect(RenderStore.state.requestErr).toBe(null);
        RenderActions.postRequestErr('err');
        jasmine.clock().tick(); // allow action
        expect(RenderStore.state.requestErr).toBe('err');
        RenderActions.clearRequestErr();
        jasmine.clock().tick(); // allow action
        expect(RenderStore.state.requestErr).toBe(null);

        expect(RenderStore.state.restApiRedirect).toBe(null);
        RenderActions.restApiRedirect('10.0.0.1');
        jasmine.clock().tick(); // allow action
        expect(RenderStore.state.restApiRedirect).toBe('10.0.0.1');
    });

});
