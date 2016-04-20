High level design of OPS-WEBUI
==============================

The GUI design is based on the following technologies:
* [ReactJS](https://github.com/facebook/react)
 * Controller-view framework
* [Redux](https://github.com/reactjs/redux)
 * State container for JavaScript applications
 * [Flux](http://facebook.github.io/react/blog/2014/05/06/flux.html) implementation with a unidirectional data flow pattern
* [React-Router](https://github.com/rackt/react-router)
 * URL routing (i.e View) framework
 * Browser history support
* [Superagent](https://visionmedia.github.io/superagent/)
 * ajax API library

```ditaa
+---------+     +-------+     +-----------------+
| Actions +---->+ Store +---->+ View Components |
+----+----+     +-------+     +-------+---------+
     ^                                |
     |                                |
     +--------------------------------+
```

This approach is taken one step further to isolate all back-end service interaction within actions.

```ditaa
+---------------------+      Calls   Calls   +---------------------------+
| A ReactJS Component +--------+       +-----| Another ReactJS Component |
+----+----------------+        |       |     +---------------------------+
             ^                 |       |
             |                 v       v
             |               +-+-------+-------+    Calls
             |               |     Action      +------------+
             |               +-+----------+----+            |
             |                 |          ^                 |
Publishes to |    Publishes to |          |                 |
             |                 |          |                 v
             |                 |          |          +------+------------+
        +----+-------------+   |          |          | A Backend Service |
        |      Store       +<--+          +----------+ (REST)            |
        +------------------+               Callback  +-------------------+
```

The major Web UI components.

```ditaa
                            +---------------------------------+
                   +------->+ index.html                      |
                   |        | index.jsx content loaded here |
                   |        +---------------------------------+
+------------------+---+
|                      |    +---------------------------------+
|  webpack.config.js   +--->+ index.jsx                       |
|  entry: [            |    | environment variable:           |
|    index.html        |    |   OPS_WEBUI_BUILD_CONFIG        |
|    index.jsx         |    |     determines build.config.js  |
|  ]                   |    +-----------------+---------------+
|                      |                      |
+----------------------+                      v
                            +-----------------+---------------+
                            | src/app/main.jsx                |
                            | Main Component                  |
                            |   parses build config for       |
                            |      settings, "Dux" files, ... |
                            |   creates react-router          |
                            |      components                 |
                            +-----+---------------------------+
                                  |
                                  v
                            +-----+---------------------------+
                            | src/app/mainApp.jsx             |
                            | App Component                   |
                            |   main application container    |
                            +-----+---------------------------+
                                  |
                                  v
+---------------------------------+----------------------+
|                                                        |
| App                                                    |
|                                                        |
| +----------------------------------------------------+ |
| |         |                                          | |
| |         |    Mast                                  | |
| |         |                                          | |
| |         +------------------------------------------+ |
| |         |                                          | |
| |         |                                          | |
| |         |                                          | |
| | NavPane |      Page (App Component's children)     | |
| |         |                                          | |
| |         |                                          | |
| |         |                                          | |
| |         |                                          | |
| |         |                                          | |
| |         |                                          | |
| |         |                                          | |
| +---------+------------------------------------------+ |
|                                                        |
+--------------------------------------------------------+
```

Entry Points
------------

The main entry points for the web compilation are configured in the `webpack.config.js` file.  The `index.html` contains a root element **div** with an ID of "main".  The navigation links and routes come from the `*dux.jsx` files specified in the `build.config.js` (described below).  Once the build configuration is loaded, the **Main** component is rendered in the DOM at the **div** root element.  The **Main** component uses the react-router framework to create the route tree based on the modules specified in the build configuration.  The top-level component **App** contains the main UI framework layout.  The **Page** area is where the child routes of the **App** component are rendered.

Build Configuration
-------------------

When the UI is compiled, it loads build configuration file.  The file is in the form:
```javascript
// import module "Dux"
import OverviewDux from 'overview/overviewDux.jsx';
import InterfaceDux from 'interface/interfaceDux.jsx';

// create an array of the loaded "Dux" modules for export below
const modules = [
  OverviewDux,
  InterfaceDux,
];

// import any guide modules
import ConfigInterfaceGuide from 'guides/configInterfaceGuide.jsx';

// create an array of the loaded "Guide" modules for export below
const guides = [
  ConfigInterfaceGuide,
];

// import the localization module
import * as i18nLocale from 'i18n/en-US.js';

// import the box graphic modules
import As5712 from 'boxGraphics/as5712.jsx';
import As6712 from 'boxGraphics/as6712.jsx';

// create the settings object based on the loaded modules
const settings = {

  // Global constants for this build
  AUTO_ACTIONS_INTERVAL: 10000,
  VLAN_ID_RANGE: '1-4094',
  LAG_ID_RANGE: '1-2000',
  LAG_MAX_INTERFACES: 8,

  // localization object loaded above
  i18nLocale,

  // box graphic components supported in this build
  boxGraphics: [ As5712, As6712 ],

  // REST redirection (default is '')
  agent: {
    prefix: '',
  },

  // Any external links (accessible in the navigation bar)
  extLinks: [
    {
      key: 'osApi',
      href: '/api/index.html'
    },
    {
      key: 'osNet',
      href: 'http://openswitch.net'
    },
  ],

};

export default { modules, guides, settings };
```

The default build configuration file is named `build.config.js`.  Set the environment variable **OPS_WEBUI_BUILD_CONFIG** to specify a different filename.


Dux Components
--------------
The Web UI modules are located in `src/modules`. Each module is contained in its own directory. Each module must contain a valid **Dux** file in the form:
```javascript
export default {
  // String name of this module (required)
  NAME,

  // Array of navigation object (optional)
  NAVS,

  // Object containing the action functions (optional)
  ACTIONS,

  // Redux "reducer" function (optional)
  REDUCER: AD.reducer(),
};
```

The **NAV** array has the form:
```javascript
const NAVS = [
  {
  	// Specifics the react-router Route's path and component
    route: { path: '/ecmp', component: EcmpPage },
    // Specifies the navigation path and order index
    link: { path: '/ecmp', order: 350 }
  },
];
```
The navigation link order determine what order (from top low to bottom high) the navigation items will appear.

The **ACTIONS** object has the form:
```javascript
const ACTIONS = {
  // Action that uses the Redux Thunk middleware that returns a function.
  fetch() {
    returns (dispatch, getStoreFn) => {...}
  }

  // Action that returns an object (is automatically bound to the dispatcher)
  clearError() {
    return return { type: 'MY_ACTION' };
  },
}
```

The **modules** specified in the build config must be an array of valid **Dux** components.  During initialization, the loaded **Dux** components are parsed to determine what routes and navigation items are avialble.  In this way, different builds can include or exclude different functionality.


Development environment
-----------------------

The **ops-webui** directory structure (described below) includes:

* `.babelrc` - javascript/JSX [Babel](https://babeljs.io/) compiler configuration
* `.eslintrc` - javascript/JSX [ESLint](http://eslint.org/) rule definitions
* `aliases.sh` - can be sourced by bash, aliases of "npm run ..." commands
* `package.json` - nodeJS/npm dependences and npm command definitions
* `webpack.config.js` - [Webpack Module Bundler](https://webpack.github.io/) configuration
* `index.html` - copied to ./build
* `build.config.js` - default build configuration
* `karma.*` - unit test framework files
* `build/` - all built artifacts go here
  * `index.html` - contains the main application _div_
  * `bundle.js` - all compiled javascript and style
  * _images, icons, & fonts_
* `node_modules/` - all 3rd party npm modules are install here
  * `react/`
  * `grommet/`
  * _...etc..._
* `src/` - all javascript/JSX source
  * `shared/` - shared business logic, components and resources
    * `assets/` - fonts and icons
    * `boxGraphics/` - box graphic component and device drawings
    * `components/` - ReactJS shared components
    * `i18n/` - localization component and locale text (i.e. en-US.js)
    * `test/` - business logic tests
    * _business logic modules_
  * `app/` - main application source
    * _global scss styles, main framework, layout, navigation_
  * `modules/` - plug-in module directories
    * `exampleModule/` - example module directory
      * `exampleConst.jsx` - constant definitions (i.e. client-server shared keys)
      * `exampleDux.jsx` - Dux file for this module (imported in the build config)
      * `examplePage.jsx` - page component (Dux will have a route component for this)
      * `exampleDetails.jsx` - detail component (optional)
      * `exampleEdit.jsx` - edit component (optional)
* `tools/` - development tools (build and test)
  * `scripts/` - script tools (tar/untar node modules)
  * `reference/` - backup directory for legacy code (not used)

The development stack is based on the following technologies:
* [NodeJS / npm](https://nodejs.org/en)
 * used to load 3rd party modules
 * used to issue build and test commands
 * `package.json` file is used to store:
   * versioned list of run-time dependencies
   * versioned list of development dependencies
   * npm build commands (see below)
* [Webpack](https://webpack.github.io) module builder
   * used to transpile files
     * JSX -> JavaScript
     * SCSS -> CSS
   * used to load modules via the CommonJS pattern (i.e. require('moduleName'))
   * used to build `bundle.js`
   * used to minimize `bundle.js` for production builds
* [Karma](http://karma-runner.github.io/0.13/index.html) test runner
 * uses [Jasmine](http://jasmine.github.io/) test framework (also see [jasmine introduction](http://jasmine.github.io/2.0/introduction.html))
 * tests are located in `\__tests__` directories within
   * `src/utils/`
   * `src/stores/`
   * `src/actions/`

Reponsibilities
---------------
The Web UI module provides a graphical user interface designed to run on desktop as well as mobile platforms. The features are geared towards:
* General system information (i.e. model number, version, ...).
* Current hardware status & statistics (i.e. fan temperature, power faults, ...).
* Network status & statistics (i.e. interface utilization, VLAN status, ...).
* Basic "Quick Start" configuration

Design choices
--------------
[Grommet](http://grommet.io/docs/), which is an open source UX framework for enterprise applications lead by HP, was selected early in the process.  This framework is based on [ReactJS](https://github.com/facebook/react).

The **ops-webui** development environment uses a subset of the Grommet _modular development environment_ stack.  To this end, Grommet can be viewed as just another NodeJS module. This reduces the coupling but still allows full access to the entire set of Grommet components and assets. The only build tools needed are NodeJS and Webpack ([Gulp](http://gulpjs.com/) and [Bower](http://bower.io/) are not needed).

Grommet doesn't necessarily specify which [Flux](https://facebook.github.io/react/docs/flux-overview.html) implementation to use. However, Grommet's UI prototype _Ferret_ is leveraging [Redux](http://redux.js.org/) so the same package was selected for use here.

Based on several meetings and discussions with OpenSwitch architects, the current _auto generated_ REST API to obtain the data to be displayed by the GUI was chosen. Because this requires the GUI to perform a large number of REST requests, a shim layer was created to allow the browser to make these requests in parallel.  However, most browsers only allow a small number of socket requests (~5) to be open at the same time.

The [Tornado](http://www.tornadoweb.org/en/stable/) HTTP service provides the static application files and _auto generated_ REST.

Relationships to external OpenSwitch entities
---------------------------------------------

```ditaa
+------------------------------------------------------------+
|     Client Browser (feature/webui)                         |
+------------------------+-------------------+---------------+
                         |
  HTTPS GET/POST/...     |
  (token authentication) |
                         |
+------------------------------------------------------------+
|  OpenSwitch Platform   |                                   |
|                        v                                   |
|  +---------------------+--+                                |
|  | Tornado Web Server     |                                |
|  | (HTTPS)                +----------------+               |
|  +-----------+------------+                |               |
|              |                             |               |
|              |                             |               |
|              v                             |               |
|  +-----------+------------+                |               |
|  | REST (auto generated)  |                v               |
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
* `/rest/v1/system`
 * various info & configuration
 * management interface
* `/rest/v1/system/interfaces`
 * Interface rx/txBytes, properties, etc.
* `/rest/v1/system/bridges/bridge_normal/ports`
 * Port-VLAN associations
 * Port-LAG associations
* `/rest/v1/system/bridges/bridge_normal/vlans`
 * VLANs
* `/rest/v1/system/subsystems/base/temp_sensors`
 * temperature status & statistics
* `/rest/v1/system/subsystems/base/fans`,
 * fan status
* `/rest/v1/system/subsystems/base/power_supplies`
 * power supply status

Internal structure: Pages
-------------------------
As previously described, the main components are:
* App - application component
 * Mast - mast component
 * NavPane - navigation pane component
 * Pages - various page components (contained in the modules directories)

Leveraging the [React-Router](https://github.com/rackt/react-router) framework each **Page** is associated with a _route_.
```javascript
<Route name="/dashboard" component={DashboardPage}/>
```
_As described above, this is defined by the modules **NAVS** route object in its **Dux** file._

When a particular route is active (window location URL is set to the route), its associated link is given the _active_ class.
```javascript
<Link onClick={clickFn} to="/dashboard">"Dashboard"</Link>
```
_As described above, this is defined by the modules **NAVS** link object in its **Dux** file._

The **Main** component is rendered by `index.jsx`:
```javascript
ReactDOM.render(
  <Main/>,
  document.getElementById('main')
);
```
Since the **App** component is also a route (parent to all routes), it is rendered along with the child route based on the URL.
```javascript
<Route name="/app" path="/" handler={App}>
  <Route name="/dashboard" handler={DashboardPage}/>
</Route>
```
Therefore a window location URL of "#/dashboard" selects the **DashboardPage** component to be loaded/rendered.

```ditaa
+---------------------+
| App                 |
| +-----------------+ |
| | RouteHandler    | |
| |                 | |
| | +-------------+ | |
| | |             | | |
| | |  Page       | | |
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
|DashboardPage|   |MgmtIntfPage|   |PortMgmtPage|   |...|
+-------------+   +------------+   +------------+   +---+
```

A **Page** component's _render_ method is invoked and content is added to the DOM appropriately within the **RouteHandler**.

```javascript
class DashboardPage extends Component {
  render() {
    return <div>...</div>;
  }
}
```

From this point on, the view component behaves as any _normal_ [ReactJS](https://github.com/facebook/react) framework component. In addition, each **Page** has access to the one and only **Store**.  The component can specify which parts of the **Store** it would like to connect it properties

```javascript
function select(store) {
  return {
    dashboard: store.dashboard,
  };
}

export default connect(select)(DashboardPage);
```
In the above example code, _store.dashboard_ will be available in the component as _this.props.dashboard_.  In this way, the component will get re-rendered when the _store.dashboard_ data changes.

Internal structure: Store
--------------------------
The **Store** provides data for the entire application.  For example, the **DashboardPage** is backed by the _store.dashboard_ data object:
```javascript
store: {
    dashboard: {},
    interfaces: {},
    ...
}
```
Any component can _connect_ to any object in the **Store** using **Redux** _connect_.  The **Store** is _only_ ever updated by a module's _reducer_ function:
```javascript
function REDUCER(moduleStore = INITIAL_STORE, action) {
  switch (action.type) {...}
```
The following provided reducer can be used for asynchronous support. This reducer includes REQUEST, FAILURE and SUCCESS actions
```javascript
const AD = new AsyncDux(NAME, INITIAL_STORE);
AD.reducer(),
```
See `asyncDux.js` for more information.

Internal structure: Actions
---------------------------
An **Action** can be invoked globally from any **Page** (routed) components. All actions (from all loaded modules) are injected into the properties of a component during initialization. Invoking an action takes the form:
```javascript
this.props.actions.dashboard.fetch()
```
Based on the **Redux** framework, this action might take the form:
```javascript
const ACTIONS = {
  fetch() {
    // return a function here, not a "simple" action object
    return (dispatch) => {
      // dispatch the request action (using asyncDux helper here)
      dispatch(AD.action('REQUEST', { title: t('loading') }));
      // Use Superagent to make the AJAX request
      Agent.get(url).end((error, result) => {
        if (error) {
          // dispatch the error action (using asyncDux helper here)
          return dispatch(AD.action('FAILURE', { error }));
        }
        // dispatch the success action proving the result and parser (using asyncDux helper here)
        return dispatch(AD.action('SUCCESS', { result, parser }));
      });
    };
  }
}
```
In the 'SUCCESS' case above the provided _parser_ argument is a function that is used to parse the JSON response data and return an object that will be injected into the **Store** at the module's location.  For example:
```javascript
const parser = (result) => {
  const data = result.body;
  return { entries: {1: 'new1', 2: 'new2', ... } };
};
```
If the module was named "dashboard", new data would be set in the **Store** under the "dashboard" key:
```javascript
store: {
    dashboard: { entries: {1: 'new1', 2: 'new2', ... } },
}
```

References
----------
Source dependencies:
* [ReactJS](https://github.com/facebook/react)
* [Redux](http://redux.js.org/)
* [Flux](http://facebook.github.io/react/blog/2014/05/06/flux.html)
* [React-Router](https://github.com/rackt/react-router)
* [Grommet](http://grommet.io/docs/)
* [SuperAgent](https://visionmedia.github.io/superagent/)

Development dependencies:
* [ESLint](http://eslint.org/)
* [Sassy CSS](http://sass-lang.com/guide)
* [Webpack Module Bundler](https://webpack.github.io/)
* [NodeJS / npm](https://nodejs.org/en)
* [Karma](http://karma-runner.github.io/0.13/index.html)
* [Jasmine](http://jasmine.github.io/)
* [jasmine introduction](http://jasmine.github.io/2.0/introduction.html)

OpenSwitch HTTP server:
* [Tornado](http://www.tornadoweb.org/en/stable/)
