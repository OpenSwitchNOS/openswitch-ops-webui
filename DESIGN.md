High level design of OPS-WEBUI
==============================

System Design
-------------

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

GUI Design
----------

The GUI design is based on the following technologies:
* [ReactJS](https://github.com/facebook/react)
 * Controller-view framework
* [RefluxJS](https://github.com/reflux/refluxjs)
 * [Flux](http://facebook.github.io/react/blog/2014/05/06/flux.html) implementation with a unidirectional data flow pattern
* [React-Router] (https://github.com/rackt/react-router)
 * URL routing (i.e View) framework
 * Browser history support


    +---------+     +--------+     +-----------------+
    | Actions +---->+ Stores +---->+ View Components |
    +----+----+     +--------+     +-------+---------+
         ^                                 |
         |                                 |
         +---------------------------------+

This approach is taken one step further to isolate all back-end service interaction within actions.

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

The major Web UI components

    *
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
    | |         |  |               ^                       | |
    | |         |  |               |                       | |
    | +---------+  +---------------------------------------+ |
    |                              |                         |
    +--------------------------------------------------------+
                                   |
           +----------------+------+---------+------------+
           |                |                |            |
    +------+------+   +-----+------+   +-----+------+   +-+-+
    |DashboardView|   |MgmtIntfView|   |PortMgmtView|   |...|
    +-------------+   +------------+   +------------+   +---+

The main entry points for the web compilation are configured in the webpack.config.js file.  The index.html contains a root element "div" with an ID. The router.js file contains a list of all the available routes (or considered "views" in our case).  Each view is denoted by its own ID ("app" -> App component).  Based on the current browser window.location (or URL), the appropriate view is loaded in the RouteHandler.  The NavPane "Link" items are automatically activated based on the current URL.

(TODO)

Development Environment
-----------------------

The directory structure (described below) includes:

    ../ops-webui
        .eslintrc - javascript/JSX ESLint rule definitions
        aliases.sh - can be sourced by bash, aliases of "npm run ..." commands
        package.json - nodeJS/npm dependences and npm command definitions
        webpack.config.js - webpack module bundler configuration
        /build - all built artifacts go here (empty until a build is performed)
            index.html
            bundle.js - all compiled javascript and styles
            (images, icons. fonts)
        /node_modules - all 3rd party npm modules are install here
            /react
            /grommet
            (...etc...)
        /src - all javascript and styles
            /font - all font files
            /img - all image files
            /js - all javascript/JSX files
                /actions - action modules
                /components - ReactJS components that are building blocks (not views)
                /i18n - internationalization text (i.e. en-US.js)
                /main - framework modules/components (i.e. mast, navpane, ...)
                /stores - store modules
                /utils - general javascript utility modules
                /views - ReactJS components that are views (associated with a navigation route)
            /scss - all style files
                /components - styles associated with building block components
                /views - styles associated with views
                app.scss - main framework styles (i.e. mast, navpane, ...)
                index.scss - main style entry point (sets globals and loads all style files)
            index.html - bare bones single page that contains single content div
        /tools - development tools (build and test)
            /loader - custom webpack loaders needed for building
            /reference - backup directory for legacy code (not used)
            /test - test configuration and helper files

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

User Guide
----------

Once NodeJS/npm is installed, the npm build commands (defined in package.json) can be run from the ops-webui root directory.  For example:

    ops-webui$ npm run build

    > webapp@0.0.0 build /home/fjw/openswitch/ops-webui
    > webpack --progress

There is an aliases.sh file in the ops-webui root directory that can be sourced that provide aliases for each command.

    alias wb='npm run build'
    alias wbw='npm run buildwatch'
    alias wbd='npm run builddebug'
    alias wbp='npm run buildprod'
    alias wtw='npm run testwatch'
    alias wt='npm run test'
    alias wds='./node_modules/webpack-dev-server/bin/webpack-dev-server.js --hot --inline'

There commands are described below:
* wb - single-run build creates index.html, bundle.js and other assets in ./build
* wbw - continuous build, same as build but reruns when files change
* wbd - single-run build with more verbose output
* wbp - single-run build with the addition minimizing bundle.js
* wt - single-run unit tests (karma/jasmine tests are located in __test__ directories)
* wtw - continuous testing, same as test but reruns when files change
* wds - runs the webpack development server with hot change support



Reponsibilities
---------------
Discuss module responsibilities

Design choices
--------------
Discuss any design choices that were made.

Relationships to external OpenSwitch entities
---------------------------------------------
{% ditaa %}
Put ascii diagram in the format of http://ditaa.sourceforge.net/
include relationship to ovsdb-server, ops-appctl if available and any other relationships
You can use http://asciiflow.com/ or any other tool to generate the diagram.
{% endditaa %}
Provide detailed description of relationships and interactions.

OVSDB-Schema
------------
Discuss which tables/columns this module is interested in. Where it gets the configuration, exports statuses and statistics. Anything else which is relevant to the data model of the module.

Internal structure
------------------
Put diagrams and text explaining major modules, threads, data structures, timers etc.

Any other sections that are relevant for the module
---------------------------------------------------

References
----------
* [Reference 1](http://www.openswitch.net/docs/redest1)
* ...

Include references to any other modules that interact with this module directly or through the database model. For example, CLI, REST, etc.
ops-fand might provide reference to ops-sensord, etc.
