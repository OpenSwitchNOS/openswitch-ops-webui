/*
 * Create and run the router.
 * @author Kelsey Dedoshka
 * @author Frank Wood
 */

var React = require('react'),
    Router = require('react-router'),
    Route = Router.Route,
    DefaultRoute = Router.DefaultRoute,

    Login = require('Login'),
    LagView = require('LagView'),
    SystemMonitorView = require('SystemMonitorView'),
    SystemMonitorChart = require('SystemMonitorChart'),
    DashboardView = require('DashboardView'),
    PortMonitorView = require('PortMonitorView'),
    PortMgmtView = require('PortMgmtView'),
    TestView1 = require('TestView1'),
    TestView2 = require('TestView2'),
    TestView3 = require('TestView3'),
    VlanMgmtView = require('VlanMgmtView'),
    VlanMonitorView = require('VlanMonitorView'),
    VlanPortConfigView = require('VlanPortConfigView'),
    MgmtIntfView = require('MgmtIntfView'),

    App = require('App');

var routes = (
    <Route name="app" path="/" handler={App}>
        <Route name="login" handler={Login}/>
        <Route name="dashboard" handler={DashboardView}/>
        <Route name="portMgmt" handler={PortMgmtView}/>
        <Route name="portMonitor" handler={PortMonitorView}>
            <Route path=":port" handler={PortMonitorView}/>
        </Route>
        <Route name="lag" handler={LagView}/>
        <Route name="systemMonitor" handler={SystemMonitorView}>
            <Route path=":type" handler={SystemMonitorChart}/>
        </Route>
        <Route name="test1" handler={TestView1}/>
        <Route name="test2" handler={TestView2}/>
        <Route name="test3" handler={TestView3}/>
        <Route name="vlanMgmt" handler={VlanMgmtView}/>
        <Route name="vlanMonitor" handler={VlanMonitorView}/>
        <Route name="vlanPortConfig" handler={VlanPortConfigView}/>
        <Route name="mgmtIntf" handler={MgmtIntfView}/>
        <DefaultRoute handler={Login}/>
    </Route>
);

// Attach the routes to the document.body
Router.run(routes, function(Handler) {
    React.render(<Handler />, document.body);
});
