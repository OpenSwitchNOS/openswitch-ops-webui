/*
 * Create and run the router.
 * @author Kelsey Dedoshka
 * @author Frank Wood
 */

var React = require('react'),
    Router = require('react-router'),
    Route = Router.Route,
    DefaultRoute = Router.DefaultRoute,

    DashboardView = require('DashboardView'),
    IpView = require('IpView'),
    LldpView = require('LldpView'),
    MonitorView = require('MonitorView'),
    VlansView = require('VlansView'),
    PortsMonitorView = require('PortsMonitorView'),
    PortsConfigView = require('PortsConfigView'),
    TestView1 = require('TestView1'),
    TestView2 = require('TestView2'),
    TestView3 = require('TestView3'),

    App = require('App');

var routes = (
    <Route name="app" path="/" handler={App}>
        <Route name="dashboard" handler={DashboardView}/>
        <Route name="vlans" handler={VlansView}/>
        <Route name="portMonitor" handler={PortsMonitorView}/>
        <Route name="portConfig" handler={PortsConfigView}/>
        <Route name="lldp" handler={LldpView}/>
        <Route name="ip" handler={IpView}/>
        <Route name="monitor" handler={MonitorView}/>
        <Route name="test1" handler={TestView1}/>
        <Route name="test2" handler={TestView2}/>
        <Route name="test3" handler={TestView3}/>
        <DefaultRoute handler={DashboardView}/>
    </Route>
);

// Attach the routes to the document.body
Router.run(routes, function(Handler) {
    React.render(<Handler />, document.body);
});
