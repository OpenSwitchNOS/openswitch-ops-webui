/*
 (C) Copyright 2015 Hewlett Packard Enterprise Development LP

    Licensed under the Apache License, Version 2.0 (the "License"); you may
    not use this file except in compliance with the License. You may obtain
    a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
    License for the specific language governing permissions and limitations
    under the License.
*/

/*
 * Create and run the router.
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
