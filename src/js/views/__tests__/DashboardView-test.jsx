/*
 * Test View.
 * @author Frank Wood
 */

describe('Test Suite For DashboardView', function() {

    var React, TestUtils, DashboardView;

    beforeEach(function() {
        React = require('react/addons');
        TestUtils = React.addons.TestUtils;
        DashboardView = require('DashboardView');
    });

    it('can be created', function() {
        var view = TestUtils.renderIntoDocument(<DashboardView />);
        expect(view).toBeDefined();
    });

});
