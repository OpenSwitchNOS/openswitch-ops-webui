OPS-WebUI
=========

What is ops-webui?
------------------

ops-webui is a module in the [OpenSwitch](http://www.openswitch.net) project that is responsible for displaying information about the switch via a Web User Interface.

This project leverages:
* [NodeJS / npm](https://nodejs.org/en)
* [ReactJS](https://github.com/facebook/react)
  * Controller-view framework
* [Redux](https://github.com/reactjs/redux)
  * State container for JavaScript applications
* [React-Router](https://github.com/rackt/react-router)
  * URL routing (i.e View) framework
  * Browser history support
* [Superagent](https://visionmedia.github.io/superagent/)
  * ajax API library

Repository Structure
--------------------
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

License Information
--------------------
ops-webui is using the Apache 2.0 license. For more details refer to [COPYING](COPYING).

Other documents
-----------------------------------
For the high level design of ops-webui, refer to [DESIGN.md](DESIGN.md)
For the current list of contributors and maintainers, refer to [AUTHORS](AUTHORS)

For general information about OpenSwitch project refer to http://www.openswitch.net
