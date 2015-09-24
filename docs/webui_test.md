Testing for OPS-WEBUI
=====================

The current Web UI testing consists of
* Automated JavaScript unit tests
* Manual GUI tests

This document only describes the developer automated JavaScript units.

Automated JavaScript Unit Tests
===============================

This testing uses the following NodeJS modules:
* [NodeJS / npm](https://nodejs.org/en) - used to run the JavaScript development tools
* [Webpack Module Bundler](https://webpack.github.io/) - module builder
* [Karma](http://karma-runner.github.io/0.13/index.html) - unit test runner
* [Jasmine](http://jasmine.github.io/) - unit test framework (see also [jasmine introduction](http://jasmine.github.io/2.0/introduction.html))

Additionally, there are test support files located in **tools/test**
* karma.config.js - Karma configuration file (resues webpack configuration)
* mock-ajax.js - 3rd party library that provides mocking of ajax requests
* tests.webpack.js - used by Karma to find and run all the test files

Shell Test Commands
-------------------
The npm build commands (defined in package.json) can be run from the **ops-webui** root directory.  For example:

    ops-webui$ npm run test

There is an aliases.sh file in the ops-webui root directory that can be sourced that provide aliases for each command.  For example:

    alias wb='npm run build'

* wt - single-run unit tests (karma/jasmine tests are located in \__test__ directories)
* wtw - continuous testing, same as test but reruns when files change

Tests
-----

    Start:
     Test Suite For InterfaceActions
       ✔ completes correctly ignoring non system interfaces
       ✔ fails the first pass correctly
       ✔ fails the second pass correctly
     Test Suite For SystemInfoActions
       ✔ completes correctly
       ✔ fails correctly
     Test Suite For SystemStatsActions
       ✔ completes correctly
       ✔ fails the first pass correctly
       ✔ fails the second pass correctly
     Test Suite For InterfaceStatsStore
       ✔ correct initial settings
       ✔ works for the first stat update
       ✔ works for 2 stat updates
       ✔ works for 3 stat updates
       ✔ multi updates, half duplex, sort & truncing top utl
       ✔ handles duplex changes
       ✔ handles speed changes & 10 second interval
     Test Suite For PortsMgmtStore
       ✔ correct initial state of the store
       ✔ sets single port into all ports into state.allPorts
       ✔ sets list of ports into all ports in state.allPorts
       ✔ sets the list of port status in state.portStatus
     Test Suite For PortsMonitorStore
       ✔ correct initial state of the store
       ✔ correct state of dataSets on loadGraphs - half and full duplex
       ✔ correct state of graph show var when toggling display
       ✔ correct state of chart type and active details
     Test Suite For RenderStore
       ✔ correct initial settings
       ✔ handles all actions correctly
     Test Suite For VlanMgmtStore
       ✔ correct initial state of the store
       ✔ correct state of show port details
       ✔ correct state of close port details
       ✔ correct state of loading vlans
     Test suite for calculations
       ✔ handles 2 normal data points
       ✔ handles prev 0
       ✔ handles curr 0
       ✔ handles speed 0
       ✔ handles string parameters and above 100%
       ✔ handles interval as 0
     Test suite for conversions
       ✔ testing bps to gbps conversion
       ✔ testing bytes to mb conversion
       ✔ testing rounding to 1 decimal place
     Test Suite For i18n
       ✔ handles keys & paths, unknown keys & paths
       ✔ has the correct default locale
     Test Suite For restUtils
       ✔ get single URL
       ✔ get single URL with error
       ✔ get URL array in parallel
       ✔ get URL array in parallel with error
       ✔ 3 passes - single, parallel, parallel
       ✔ 3 passes - single, parallel, parallel with error
       ✔ differnt base URL array in parallel

    Finished in 0.098 secs / 0.131 secs

    SUMMARY:
    ✔ 47 tests completed
