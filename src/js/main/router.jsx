/*
 * Create and run the router.
 * @author Kelsey Dedoshka
 * @author Frank Wood
 */

var React = require('react'),
    Router = require('react-router'),
    Route = Router.Route,
    DefaultRoute = Router.DefaultRoute,

    BgpView = require('BgpView'),
    DashboardView = require('DashboardView'),
    PortMgmtView = require('PortMgmtView'),
    PortMonitorView = require('PortMonitorView'),
    StaticRoutesView = require('StaticRoutesView'),
    SystemMonitorView = require('SystemMonitorView'),
    TestView1 = require('TestView1'),
    TestView2 = require('TestView2'),
    TestView3 = require('TestView3'),
    VlanMgmtView = require('VlanMgmtView'),
    VlanMonitorView = require('VlanMonitorView'),
    VlanPortConfigView = require('VlanPortConfigView'),

    App = require('App');

var routes = (
    <Route name="app" path="/" handler={App}>
        <Route name="bgp" handler={BgpView}/>
        <Route name="dashboard" handler={DashboardView}/>
        <Route name="portMgmt" handler={PortMgmtView}/>
        <Route name="portMonitor" handler={PortMonitorView}/>
        <Route name="staticRoutes" handler={StaticRoutesView}/>
        <Route name="systemMonitor" handler={SystemMonitorView}/>
        <Route name="test1" handler={TestView1}/>
        <Route name="test2" handler={TestView2}/>
        <Route name="test3" handler={TestView3}/>
        <Route name="vlanMgmt" handler={VlanMgmtView}/>
        <Route name="vlanMonitor" handler={VlanMonitorView}/>
        <Route name="vlanPortConfig" handler={VlanPortConfigView}/>
        <DefaultRoute handler={DashboardView}/>
    </Route>
);

// Attach the routes to the document.body
Router.run(routes, function(Handler) {
    React.render(<Handler />, document.body);
});
