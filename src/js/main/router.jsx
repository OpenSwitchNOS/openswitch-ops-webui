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
    VlanMgmtView = require('VlanMgmtView'),
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
        <Route name="vlanMgmt" handler={VlanMgmtView}/>
        <Route name="mgmtIntf" handler={MgmtIntfView}/>
        <DefaultRoute handler={DashboardView}/>
    </Route>
);

// Attach the routes to the document.body
Router.run(routes, function(Handler) {
    React.render(<Handler />, document.getElementById('appContent'));
});
