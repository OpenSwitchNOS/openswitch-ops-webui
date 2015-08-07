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
        expect(RenderStore.state.screenType).toBe('normal');
        expect(RenderStore.state.showNavPane).toBe(true);
    });

    it('sets screenType and showNavPane', function() {
        RenderActions.smallScreen();
        jasmine.clock().tick(); // allow action
        expect(RenderStore.state.screenType).toBe('small');
        expect(RenderStore.state.showNavPane).toBe(true);

        RenderActions.hideNavPane();
        jasmine.clock().tick(); // allow action
        expect(RenderStore.state.screenType).toBe('small');
        expect(RenderStore.state.showNavPane).toBe(false);

        RenderActions.toggleNavPane();
        jasmine.clock().tick(); // allow action
        expect(RenderStore.state.screenType).toBe('small');
        expect(RenderStore.state.showNavPane).toBe(true);
    });

});
