High level design of FEATURE
============================

High level description of a FEATURE design.

If the feature is essentially composed out of a single daemon (don’t count OVSDB-Server and management interfaces, unless they have some very special role in the feature design), then just reference to a DESIGN.md document of the repo that contains the daemon. Otherwise continue to the next sections.

Design choices
--------------
Discuss any design choices that were made.

Participating modules
---------------------
{% ditaa %}
Put ascii block diagram in the format of http://ditaa.sourceforge.net/
include relationships of all participating modules including OVSDB-Server.
You can use http://asciiflow.com/ or any other tool to generate the diagram.
{% endditaa %}
Explain all interactions between the modules that sum up to the feature functionality. Add flow diagrams as appropriate.

OVSDB-Schema
------------
Discuss which tables/columns this feature interacts with. Where it gets the configuration, exports statuses and statistics. Reference specific modules DESIGN.md documents for further information on the schema.


Any other sections that are relevant for the module
---------------------------------------------------

References
----------
* [Reference 1](http://www.openswitch.net/docs/redest1)
* ...

Include references to DESIGN.md of any module that participates in the feature.
Include reference to user guide of the feature.





Developer Guide (THIS WILL BE MOVED TO ANOTHER DOCUMENT)
---------------

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
* wt - single-run unit tests (karma/jasmine tests are located in \__test__ directories)
* wtw - continuous testing, same as test but reruns when files change
* wds - runs the webpack development server with hot change support

Testing?
