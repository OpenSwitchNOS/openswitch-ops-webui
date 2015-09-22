High level design of OPS-WEBUI
==============================

The GUI design is based on the following technologies:
* [ReactJS](https://github.com/facebook/react)
 * Controller-view framework
* [RefluxJS](https://github.com/reflux/refluxjs)
 * [Flux](http://facebook.github.io/react/blog/2014/05/06/flux.html) implementation with a unidirectional data flow pattern
* [React-Router] (https://github.com/rackt/react-router)
 * URL routing (i.e View) framework
 * Browser history support

```ditaa
+---------+     +--------+     +-----------------+
| Actions +---->+ Stores +---->+ View Components |
+----+----+     +--------+     +-------+---------+
     ^                                 |
     |                                 |
     +---------------------------------+
```

This approach is taken one step further to isolate all back-end service interaction within actions.

```ditaa
+---------------------+      Calls   Calls   +---------------------------+
| A ReactJS Component +--------+       +-----| Another ReactJS Component |
+----+----------------+        |       |     +---------------------------+
             ^                 |       |
             |                 v       v
             |               +-+-------+-------+    Calls
             |               | A Reflux Action +------------+
             |               +-+----------+----+            |
             |                 |          ^                 |
Publishes to |    Publishes to |          |                 |
             |                 |          |                 v
             |                 |          |          +------+------------+  
        +----+-------------+   |          |          | A Backend Service |  
        | A RefluxJS Store +<--+          +----------+ (REST)            |  
        +------------------+               Callback  +-------------------+  
```

The major Web UI components

```ditaa
                            +---------------------------------+
                   +------->+ src/index.html                  |
                   |        | (index.jsx content loaded here) |
                   |        +---------------------------------+
+------------------+---+
|                      |    +---------------------------------+
|  webpack.config.js   +--->+ src/js/index.jsx                |
|  entry: [            |    +-----------------+---------------+
|    src/index.html,   |                      |
|    src/js/index.jsx  |                      v
|  ]                   |    +-----------------+---------------+
|                      |    | src/js/main/router.js           |
+----------------------+    | (react-router routes)           |
                            | "app" -> App.jsx                |
                            | "dashboard" -> Dashboard.jsx    |                   
                            | ...etc...                       |
                            +-----+---------------------------+
                                  |
                                  v
+---------------------------------+----------------------+
|                                                        |
| App                                                    |
|                                                        |
| +----------------------------------------------------+ |
| |                                                    | |
| | Mast                                               | |
| |                                                    | |
| +----------------------------------------------------+ |
|                                                        |
| +---------+  +---------------------------------------+ |
| |         |  |                                       | |
| | NavPane |  | RouteHandler                          | |
| |         |  |                                       | |
| |         |  |   +-------------------------------+   | |
| |         |  |   |                               |   | |
| |         |  |   |  View                         |   | |
| |         |  |   |                               |   | |
| |         |  |   +-----------+-------------------+   | |
| |         |  |                                       | |
| +---------+  +---------------------------------------+ |
|                                                        |
+--------------------------------------------------------+
```

The main entry points for the web compilation are configured in the webpack.config.js file.  The index.html contains a root element "div" with an ID. The router.js file contains a list of all the available routes (or considered "views" in our case).  Each view is denoted by its own ID ("app" -> App component).  Based on the current browser window.location (or URL), the appropriate view is loaded in the RouteHandler.  The NavPane "Link" items are automatically activated based on the current URL.

(TODO)

Development Environment
-----------------------

The **ops-webui** directory structure (described below) includes:

* .eslintrc - javascript/JSX [ESLint](http://eslint.org/) rule definitions
* aliases.sh - can be sourced by bash, aliases of "npm run ..." commands
* package.json - nodeJS/npm dependences and npm command definitions
* webpack.config.js - [Webpack Module Bundler](https://webpack.github.io/) configuration
* build/ - all built artifacts go here
 * index.html - contains the main application _div_
 * bundle.js - all compiled javascript and style
 * _images, icons, & fonts_
* node_modules/ - all 3rd party npm modules are install here
 * react/
 * grommet/
 * _...etc..._
* src/ - all source
 * font/ - all font files
 * img/ - all image & icon files
 * js/ - all javascript/JSX files
  * actions/ - all **action** modules
  * components/ - react building block component modules (not views)
  * i18n/ - internationalization text (i.e. en-US.js)
  * main/ - framework modules/components (i.e. mast, navpane, ...)
   * stores/ - all **store** modules
   * utils/ - general javascript utility modules
   * views/ - react view components (associated with a navigation route)
 * scss - all [Sassy CSS](http://sass-lang.com/guide) style files
  * components/ - styles associated with building block components
  * views/ - styles associated with views
  * app.scss - main framework styles (i.e. mast, navpane, ...)
  * index.scss - main style entry point (sets globals and loads all style files)
 * index.html - bare bones single page that contains single content _div_
 * tools/ - development tools (build and test)
  * loader/ - custom webpack loaders needed for building
  * reference/ - backup directory for legacy code (not used)
  * test/ - test configuration and helper files

The development stack is based on the following technologies:
* [NodeJS / npm](https://nodejs.org/en)
 * used to load 3rd party modules
 * used to issue build and test commands
 * package.json file is used to store:
   * versioned list of run-time dependencies
   * versioned list of development dependencies
   * npm build commands (see below)
* [Webpack](https://webpack.github.io) module builder
   * used to transpile files
     * JSX -> JavaScript
     * SCSS -> CSS
   * used to load modules via the CommonJS pattern (i.e. require('moduleName'))
   * used to build bundle.js
   * used to minimize bundle.js for production builds
* [Karma](http://karma-runner.github.io/0.13/index.html) test runner
 * uses [Jasmine](http://jasmine.github.io/) test framework (also see [jasmine introduction](http://jasmine.github.io/2.0/introduction.html))
 * tests are located in \__tests__ directories within
   * src/utils/
   * src/stores/
   * src/actions/

Reponsibilities
---------------
The Web UI module provides a graphical user interface designed to run on desktop as well as mobile platforms. The features are geared towards:
* General system information (i.e. model number, version, ...)
* Current hardware status & statistics (i.e. fan temperature, power faults, ...)
* Network status & statistics (i.e. interface utilization, VLAN status, ...)

Design choices
--------------
A major motivation for the following design decisions is time-to-market.  The GUI development was proposed relatively late in the project life cycle.

It was decided early on to use [Grommet](http://grommet.io/docs/hpe/), which is an open source UX framework for enterprise applications lead by HP.  This framework is based on [ReactJS](https://github.com/facebook/react).

The **ops-webui** development environment uses a subset of the Grommet _modular development environment_ stack.  To this end, Grommet can be viewed
as just another NodeJS module.  This reduces the coupling but still allows full access to the entire set of Grommet components and assets.
The only build tools needed are NodeJS and Webpack ([Gulp](http://gulpjs.com/) and [Bower](http://bower.io/) are not needed).

Grommet doesn't necessary specify which [Flux](https://facebook.github.io/react/docs/flux-overview.html) implementation to use. However, as Grommet is leveraging [RefluxJS](https://github.com/reflux/refluxjs) (and after investigating alternatives) it was decided to use the same package.

Based on several meetings and discussions with OpenSwitch architects it was decided to simply use the current _auto generated_ REST API to obtain the data to be displayed by the GUI. Because this requires the GUI to perform a large number of REST requests, a shim layer was created to allow the browser to make these requests in parallel.  However, most browsers only allow a small number of socket requests (~5) to be open at the same time.

It was decided to keep the _auto generated_ REST server [Tornado](http://www.tornadoweb.org/en/stable/) separate from the GUI Server [Lighttpd](http://www.lighttpd.net/). This allows the GUI to still use the default HTTP/HTTPS port numbers (80/443).

Relationships to external OpenSwitch entities
---------------------------------------------

```ditaa
+------------------------------------------------------------+
|     Client Browser (feature/webui)                         |
+------------------------+-------------------+---------------+
                         |                   |
  HTTPS GET/POST/...     |                   |
  (token authentication) |                   |
                         |                   |
+------------------------------------------------------------+
|  OpenSwitch Platform   |                   |               |
|                        v                   v               |
|  +---------------------+--+   +------------+------------+  |
|  | Tornado Web Server     |   | Lighttpd (static files) |  |
|  | (Port: 18091)          |   | (Port: 80)              |  |
|  +-----------+------------+   +------------+------------+  |
|              |                             |               |
|              |                             |               |
|              v                             |               |
|  +-----------+------------+                |               |
|  |REST (auto generated)   |                v               |
|  +-----------+------------+    +-----------+------------+  |
|              |                 | built artifacts        |  |
|              |                 |     index.html         |  |
|              v                 |     bundle.js          |  |
|  +-----------+------------+    |     images             |  |
|  | OVSDB                  |    |     ...etc             |  |
|  +------------------------+    +------------------------+  |
|                                                            |
+------------------------------------------------------------+
```

REST API URLs
-------------
* /rest/v1/system
 * various info & configuration
 * management interface
* /rest/v1/system/interfaces
 * Interface rx/txBytes, properties, etc.
* /rest/v1/system/bridges/bridge_normal/ports
 * Port-VLAN associations
 * Port-LAG associations
* /rest/v1/system/bridges/bridge_normal/vlans
 * VLANs
* /rest/v1/system/subsystems/base/temp_sensors'
 * temperature status & statistics
* /rest/v1/system/subsystems/base/fans',
 * fan status
* /rest/v1/system/subsystems/base/power_supplies'
 * power supply status

Internal structure: Views
-------------------------
As previously described, the main components are:
* App - application component
 * Mast - mast component
 * NavPane - navigation pane component
 * Views - various view components

Leveraging the [React-Router](https://github.com/rackt/react-router) framework each **View** is associated with a _route_.

    <Route name="dashboard" handler={DashboardView}/>

When a particular route is active (window location URL is set to the route) its associated link will be given the _active_ class

    <Link onClick={clickFn} to="dashboard">"Dashboard"</Link>

The router added to the DOM at the specified ID:

    Router.run(routes, function(Handler) {
        React.render(<Handler />, document.getElementById('appContent'));
    });

Since the **App** component is also a route (parent to all routes) it is rendered along with the child route based on the URL

    <Route name="app" path="/" handler={App}>
        <Route name="dashboard" handler={DashboardView}/>
    </Route>

Therefore a window location URL of "#/dashboard" will select the **DashboardView** component to be loaded/rendered.

```ditaa
+---------------------+
| App                 |
| +-----------------+ |
| | RouteHandler    | |
| |                 | |
| | +-------------+ | |
| | |             | | |
| | |  View       | | |
| | |             | | |
| | +------+------+ | |
| |        ^        | |
| |        |        | |
| +--------+--------+ |
|          |          |
+----------+----------+
           |
           |
       +----------------+------+---------+------------+
       |                |                |            |
+------+------+   +-----+------+   +-----+------+   +-+-+
|DashboardView|   |MgmtIntfView|   |PortMgmtView|   |...|
+-------------+   +------------+   +------------+   +---+
```

A **View** component's _render_ method will be invoked and contented added to the DOM appropriately within the **RouteHandler**.

```ditaa

    module.exports = React.createClass({

        displayName: 'DashboardView',

        render: function() {
            return (
                <div id="dashboardView">
                (where the content JSX/HTML goes)
                </div>
            );
        }
```

From this point on, the view component behaves as any _normal_ [ReactJS](https://github.com/facebook/react) framework component. In addition, each **View** will be _connected_ to its own **Store**. Based on the **Store**-**View** linkage, the **View**'s state will get updated by the **Store** which will, in turn, result in a re-render of the View.

Internal structure: Stores
--------------------------
A **Store** provides each view with backing data.  For example, the **DashboardView** is backed by a **DashboardStore** that contains the following data:

    state: {
        sysInfo: {},
        sysStats: {
            fans: [],
            powerSupplies: []
        },
        interfaceStats: {}
    }

When the **DashboardStore** triggers an update, the listening view **DashboardView** will get its state modified and re-render.

Internal structure: Actions
---------------------------
An **Action** can be invoked globally from View components (or a View's child components). Each action can be synchronous or asynchronous.  Synchronous actions are the result of user actions, timers firing, etc.  Asynchronous actions are the result of loading data from the switch (REST API calls).

**All** interactions with the back-end server are performed by asynchronous actions.

**All** JSON returned by the back-end server (REST API) is not allowed outside the action module.

For example, **InterfaceActions** defines three actions:
* load
* loadFailed
* loadCompleted

A component sets up a connection to the **InterfaceStore** and then calls the asynchronous action **InterfaceActions.load()**.  Within the **InterfaceActions** implemenation the **load** action is intercepted and a request is made to the back-end REST API.  When the REST call asynchronously completes, the **loadFailed** or **loadCompleted** action will be invoked (see [SuperAgent](https://visionmedia.github.io/superagent/) for more information on ajax requests). Any stores listening to the **loadCompleted** action will be notified and will be able to handle the new data.  Each **Action** has the option of using the generic **loadFailed** handler to pop-up an error dialog to the GUI.

For more information, see the documentation for the  [RefluxJS](https://github.com/reflux/refluxjs) framework.

References
----------
Source dependencies:
* [ReactJS](https://github.com/facebook/react)
* [RefluxJS](https://github.com/reflux/refluxjs)
* [Flux](http://facebook.github.io/react/blog/2014/05/06/flux.html)
* [React-Router](https://github.com/rackt/react-router)
* [Grommet](http://grommet.io/docs/hpe/)
* [SuperAgent](https://visionmedia.github.io/superagent/)

Development dependencies:
* [ESLint](http://eslint.org/)
* [Sassy CSS](http://sass-lang.com/guide)  
* [Webpack Module Bundler](https://webpack.github.io/)
* [NodeJS / npm](https://nodejs.org/en)
* [Karma](http://karma-runner.github.io/0.13/index.html)
* [Jasmine](http://jasmine.github.io/)
* [jasmine introduction](http://jasmine.github.io/2.0/introduction.html)

OpenSwitch HTTP servers:
* [Tornado](http://www.tornadoweb.org/en/stable/)
* [Lighttpd](http://www.lighttpd.net/)

OpenSwitch modules:
* [restd](tbd)
