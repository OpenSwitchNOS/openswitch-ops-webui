*** FIXME ***
OPS-WebUI
=========

What is ops-webui
----------------
ops-webui is a module in the [OpenSwitch](http://www.openswitch.net) project that is responsible for displaying information about the switch via a Web User Interface.  This project leverages [NodeJS / npm](https://nodejs.org/en), [RefluxJS](https://github.com/reflux/refluxjs), [Flux](http://facebook.github.io/react/blog/2014/05/06/flux.html), [React-Router](https://github.com/rackt/react-router), and [Grommet](http://grommet.io/docs/).


Repository Structure
--------------------
* `.eslintrc` - javascript/JSX [ESLint](http://eslint.org/) rule definitions
* `aliases.sh` - can be sourced by bash, aliases of "npm run ..." commands
* `package.json` - nodeJS/npm dependences and npm command definitions
* `webpack.config.js` - [Webpack Module Bundler](https://webpack.github.io/) configuration
* build/ - all built artifacts go here
 * `index.html` - contains the main application _div_
 * `bundle.js` - all compiled javascript and style
 * _images, icons, & fonts_
* node\_modules/ - all 3rd party npm modules are install here
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
    * `app.scss` - main framework styles (i.e. mast, navpane, ...)
    * `index.scss` - main style entry point (sets globals and loads all style files)
 * `index.html` - bare bones single page that contains single content _div_
* tools/ - development tools (build and test)
  * loader/ - custom webpack loaders needed for building
  * reference/ - backup directory for legacy code (not used)
  * test/ - test configuration and helper files

License Information
--------------------
ops-webui is using the Apache 2.0 license. For more details refer to [COPYING](COPYING).

Other documents
-----------------------------------
For the high level design of ops-webui, refer to [DESIGN.md](DESIGN.md)
For the current list of contributors and maintainers, refer to [AUTHORS](AUTHORS)

For general information about OpenSwitch project refer to http://www.openswitch.net
