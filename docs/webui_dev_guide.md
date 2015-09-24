Developer "How-To" Guide for OPS-WEBUI
======================================
In addition to this document developers should be familiar with the following technologies:

Run-time modules:
* [ReactJS](https://github.com/facebook/react) - component bases view/control framework
* [RefluxJS](https://github.com/reflux/refluxjs) -  [Flux](http://facebook.github.io/react/blog/2014/05/06/flux.html) implementation module
* [React-Router](https://github.com/rackt/react-router) - URL route module
* [Grommet](http://grommet.io/docs/hpe/) - open source enterprise UX framework
* [SuperAgent](https://visionmedia.github.io/superagent/) - ajax request module

Development modules:
* [NodeJS / npm](https://nodejs.org/en) - used to run the JavaScript development tools
* [ESLint](http://eslint.org/) - JSX/JavaScript lint
* [Sassy CSS](http://sass-lang.com/guide) - style sheets (pre-CSS)
* [Webpack Module Bundler](https://webpack.github.io/) - module builder
* [Karma](http://karma-runner.github.io/0.13/index.html) - unit test runner
* [Jasmine](http://jasmine.github.io/) - unit test framework (see also [jasmine introduction](http://jasmine.github.io/2.0/introduction.html))

NodeJS
------
All building and packaging is performed using node's package manager (i.e. npm).

[NodeJS](https://nodejs.org)

_On Ubuntu, there is already an unrelated application called "node" that must be uninstalled.  Then, a symbolic link "node" can be made to the actually NodeJS installation._

After installation verify you have a version of node compatible with the current source base you are working on.

    ops-webui$ node -v
    v0.10.25
    $ npm -v
    1.3.24

Shell Commands
--------------
Once NodeJS/npm is installed, the npm build commands (defined in package.json) can be run from the **ops-webui** root directory.  For example:

    ops-webui$ npm run build

    > webapp@0.0.0 build /home/fjw/openswitch/ops-webui
    > webpack --progress

There is an **aliases.sh** file in the **ops-webui** root directory that can be sourced that provide aliases for each command.  For example:

    alias wb='npm run build'

Th commands include:
* **wb** - single-run build creates index.html, bundle.js and other assets in ./build
* **wbw** - continuous build, same as build but reruns when files change
* **wbd** - single-run build with more verbose output
* **wbp** - single-run build with the additional minimizing of bundle.js
* **wt** - single-run unit tests (karma/jasmine tests are located in \__test__ directories)
* **wtw** - continuous testing, same as test but reruns when files change
* **wds** - runs the webpack development server with file change support

Editor (optional)
-----------------
[Atom](https://atom.io) is a really nice editor that supports syntax highlighting of JSX.  However, you need to install the **language-babel** package.

Development Modes
=================
There are multiple development modes:

Build and copy to switch
* use this mode when you need to run on real hardware
* you must first perform an install of the current OpenSwitch software to your switch
* run the **wb** command to perform a build
* use **scp** to copy the required build files to the switch (i.e. bundle.js)

Continuous unit test
* use this mode when you are working on action, store or utility modules
* run the **wtw** command and the unit tests will run every time you save a file
* debug in this mode by connecting you browser to **localhost:9876**

Local development server (most time will be spent in this mode)
* use this mode when you want rapid feedback on any static file changes (JavaScript & styles), all your static resources are loaded locally but all ajax calls are redirected to SWITCH_IP
* you must first perform an install of the current OpenSwitch software to your switch
* run the **wds** command to run the Webpack development server which uses the same build configuration as **wb**
* each time a file is changed a new build will be performed
* debug in this mode by connecting your browser to **localhost:8080/index.html?restapi=SWITCH_IP**, where SWITCH_IP is the IP address of your switch

Implementation Example
======================

Creating a View (with associated Store & Actions)
-------------------------------------------------
As described in the design documentation, the Web UI is composed of navigable Views (or routes) associated with a URL (or link).  A View is simply a ReactJS component.

First, run the local development server (as described above):

    {feature/webui} ~/openswitch/ops-webui$ wds
    ...etc...
    webpack: bundle is now VALID.

All Views are created within the **src/js/views** directory.  The View we create will simply display the View's route ID and the switch's hostname.

    MyTestView.jsx
    --------------

    var React = require('react'),
        Reflux = require('reflux'),
        I18n = require('i18n'),
        ViewInitMixin = require('ViewInitMixin'),
        MyTestActions = require('MyTestActions'),
        MyTestStore = require('MyTestStore');

    function t(key) {
        return I18n.text('views.mytest.' + key);
    }

    module.exports = React.createClass({

        displayName: 'MyTestView',

        mixins: [
            Reflux.connect(MyTestStore),
            ViewInitMixin
        ],

        componentDidMount: function() {
            MyTestActions.load();
        },

        render: function() {
            return (
                <div>
                    <div>View: {t('name')}</div>
                    <div>Host: {this.state.hostname}</div>
                </div>
            );
        }

    });

**Note:** _ReactJS components use the .jsx extension because they contain JSX code that needs to be transpiled to JavaScript._

See [ReactJS](https://github.com/facebook/react) for more information on developing components.

Within **src/js/main/router.jsx** we need to add the new View as a route. At the top of the file, require the new View:

    MyTestView = require('MyTestView')

In the same file, add a route as a child of the **App** route

    <Route name="mytest" handler={MyTestView}/>

Once you save the **router.jsx** you should get some errors in the Webpack developer server output:

    ERROR in ./src/js/views/MyTestView.jsx
    Module not found: Error: Cannot resolve module 'MyTestActions' in /home/fjw/openswitch/ops-webui/src/js/views
     @ ./src/js/views/MyTestView.jsx 7:20-44

    ERROR in ./src/js/views/MyTestView.jsx
    Module not found: Error: Cannot resolve module 'MyTestStore' in /home/fjw/openswitch/ops-webui/src/js/views
    @ ./src/js/views/MyTestView.jsx 8:18-40
    webpack: bundle is now VALID.

Next, create a new Store within **src/js/stores**

    MyTestStore.js
    --------------

    var Reflux = require('reflux'),
        MyTestActions = require('MyTestActions');

    module.exports = Reflux.createStore({

        listenables: [ MyTestActions ],

        state: {
            hostname: null
        },

        getInitialState: function() {
            return this.state;
        },

        onLoadCompleted: function(data) {
            this.state.hostname = data.hostname;
            this.trigger(this.state);
        },

    });

Once you save the Store, you should now only see errors related to resolving module **MyTestActions**.

Create a new Actions module within **src/js/actions**

    MyTestActions.js
    ----------------

    var Reflux = require('reflux'),
        RestUtils = require('restUtils'),
        RenderActions = require('RenderActions');

    var MyTestActions = Reflux.createActions({
        // This creates the actions 'load', 'loadFailed', 'loadCompleted'
        load: { asyncResult: true },
    });

    MyTestActions.load.listen(function() {
        RestUtils.get('/rest/v1/system', function(err, res) {
            if (err) {
                this.failed(err);
            } else {
                this.completed({
                    hostname: res.body.configuration.hostname
                });
            }
        }.bind(this));
    });

    MyTestActions.load.failed.listen(function(err) {
        RenderActions.postRequestErr(err);
    });

    module.exports = MyTestActions;

Once you save the new Actions file, you should not see any errors.

See [RefluxJS](https://github.com/reflux/refluxjs) for more information on developing Stores and Actions.

Hooking It All Up
-----------------
Now that the View, Store and Actions code is created, we need to hook the View up to the NavPane so it can be displayed.  The View has already been added to the [React-Router](https://github.com/rackt/react-router) framework but we need to associate it with a navigation **Link**.

First, make sure your browser is open to

    http://localhost:8080/index.html?restapi=SWITCH_IP#/

_If authentication is enabled, you will need to login._

Now, in **src/js/main/NavPane.jsx** add the new 'mytest' route to one of the **NavGroup** elements:

    routes={[
        { to: 'dashboard' },
        { to: 'systemMonitor' },
        { to: 'mgmtIntf' },
        { to: 'mytest' }
    ]}

Once you save the file, you should see a new navigation link in the NavPane. The link text will be of the form:

    ~views.mytest.name~

All text displayed in the Web UI is localized by files in the **src/js/i18n** directory. If a key cannot be found in the localization file, the key will be displayed _as is_ surrounded by tildas.  To fix this, we need to edit **src/js/i18n/en-US.js** and under _messages/views_ create a new **mytest** object:

    mytest: {
        name: 'MyTest'
    }

Once you save the file, you should see the link text change to "MyTest" in the browser. If you click on the new link, your view should be displayed in the form:

    View: MyTest
    Host: myswitch

Congratulations! You've just added a new View to the Web UI!

Debugging Example
=================

In the previous example, we created a new View, Store and Actions.  Now, we are going to walk through how the pieces work together. Enter the debug mode for the browser.  Select the **bundle.js** in source, and search until to find:

    MyTestActions.load()

This is the line called from **MyTestView.jsx** when the component mounts:

    componentDidMount: function componentDidMount() {
        MyTestActions.load();
    },

_Notice that the code in the browser is not exactly the same as the original file, this is because we are looking the file post-processed by Webpack._

Put a breakpoint on the **MyTestActions.load()** and refresh the browser.  You should hit the break point when the View loads (called component mounting in ReactJS).

_If you don't hit the break point, make sure you are loading the new 'mytest' route (i.e. 'MyTest' is selected in the NavPane)._

Now use the same technique to find:

    MyTestActions.load.listen(function () {

and put a breakpoint on the following 2 lines below

    RestUtils.get(...)

and

    if (err) {

Now proceed past the first breakpoint.  When **MyTestActions.load()** is invoked, it is intercepted by **MyTestActions.load.listen** and a REST call is made to the switch with the specified URL.  When the response arrives, the callback is invoked. Assuming no network/switch error occurs, the **completed** action will be invoked by calling:

    this.completed({
        hostname: res.body.configuration.hostname
    });

In **MyTestActions** we created 3 actions
* load
* loadCompleted
* loadFailed

Calling **completed** is really shorthand for calling the action **loadCompleted**. Note that we pass in the data (i.e. the hostname) as an argument to the action. This is the data that will given to any listeners of the action (see [RefluxJS](https://github.com/reflux/refluxjs)).


Now, put a breakpoint in **onLoadCompleted** within the **MyTestStore** module. Search for:

    listenables: [MyTestActions]

to find the **MyTestStore** within the **bundle.js**

When you hit this breakpoint, you will see the Store update its internal state and call its **tigger** method. When a Store calls trigger, any components that are _connected_ this this Store will get notified.  There are different ways to connect to a Store (see [RefluxJS](https://github.com/reflux/refluxjs))). In this case, we are using the **Reflux.connect** mixin to connect **MyTestView** to **MyTestStore**.  Therefore, the **MyTestView** component's state will _automatically_ get updated for us behind the scenes. In the ReactJS framework, whenever a component's state gets updated, the component's **render** method will be invoked. Since our state has already been updated, we will now be able to display the correct _hostname_ value in the GUI.

You can put a breakpoint in the **render** method of **MyTestView** to monitor render function before and after the server responds with data.

Testing Example
===============

Automated JavaScript Unit Tests
-------------------------------

Testing uses the following NodeJS modules:
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
* **wt** - single-run unit tests (karma/jasmine tests are located in \__test__ directories)
* **wtw** - continuous testing, same as test but reruns when files change

Create A Unit Test Suite
------------------------
Let's make a unit test for the previously created **MyTestActions.js**. Add the following test file under the **src/js/actions/__tests__** directory:

    MyTestActions-test.js
    ---------------------

    describe('Test Suite For MyTestActions', function() {

        var MyTestActions,
            RenderActions;

        beforeEach(function() {
            MyTestActions = require('MyTestActions');
            RenderActions = require('RenderActions');
        });

        it('completes correctly', function() {
            expect(true).toBe(false);
        });

    });

There are **__tests__** directories located in:
  * src/js/actions
  * src/js/stores
  * src/js/utils

This is the style of **Jasmine** tests suites. The **describe** function is the test suite and each **it** function is an individual unit test.  Now, run **wtw** from the shell, you should get something like the following:

    SUMMARY:
    ✔ 47 tests completed
    ✖ 1 test failed

    FAILED TESTS:
      Test Suite For MyTestActions
        ✖ completes correctly
          PhantomJS 1.9.8 (Linux 0.0.0)
        Expected true to be false.
            at /home/fjw/openswitch/ops-webui/tools/test/tests.webpack.js:68827

Our goal is the create a unit test for the asynchronous **completed** and **failed** cases of **MyTestActions**. First we create some variables to store the mock URLs and data.  Add the following to variables section:

    sys = {
        testUrl: '/rest/v1/system',
        body: {
            configuration: {
                hostname: 'alswitch.rose.hp.com'
            }
        },
        processed: {
            hostname: 'alswitch.rose.hp.com'
        }
    };

First, we are going to mock the ajax request by using the helper function **AjaxStubRequest**.  This will intercept the request and return whatever data we wish.  Second, we are going to **spy** on the **loadCompleted** action to make sure it was called with the correct data.  Change the contents of the unit test function **it('completes correctly', ...** with:

    AjaxStubRequest(sys.testUrl, sys.body);

    spyOn(MyTestActions.load, 'completed');

    expect(MyTestActions.load.completed).toHaveBeenCalledWith(
        sys.processed
    );


_Remember that the Karma test runner will rerun every time to you save the test file.  It is good practice to monitor the output as you add test code._

You should get something like the following:

    SUMMARY:
    ✔ 47 tests completed
    ✖ 1 test failed

    FAILED TESTS:
      Test Suite For MyTestActions
        ✖ completes correctly
          PhantomJS 1.9.8 (Linux 0.0.0)
        Expected spy completed to have been called with [ Object({ hostname: 'alswitch.rose.hp.com' }) ] but it was never called.
            at /home/fjw/openswitch/ops-webui/tools/test/tests.webpack.js:68843

There are actually two reasons that the test failed:
* we didn't actually invoke the **loadCompleted** action
* we didn't wait for the asynchronous action to be handled

Add the following right after the **spyOn** line:

    MyTestActions.load();
    jasmine.clock().tick(); // allow action to be handled

After saving the file you should get:

    Test Suite For MyTestActions
      ✔ completes correctly

To enhance our test lets make sure that the failed case was _not_ called:

    AjaxStubRequest(sys.testUrl, sys.body);

    spyOn(MyTestActions.load, 'completed');
    spyOn(RenderActions, 'postRequestErr');

    MyTestActions.load();
    jasmine.clock().tick(); // allow action to be handled

    expect(MyTestActions.load.completed).toHaveBeenCalledWith(
        sys.processed
    );

    expect(RenderActions.postRequestErr.calls.count()).toEqual(1);

After saving this file, the test should fail because **postRequestErr** should not have been called.

    SUMMARY:
    ✔ 47 tests completed
    ✖ 1 test failed

    FAILED TESTS:
      Test Suite For MyTestActions
        ✖ completes correctly
          PhantomJS 1.9.8 (Linux 0.0.0)
        Expected 0 to equal 1.
            at /home/fjw/openswitch/ops-webui/tools/test/tests.webpack.js:68849

Change the 1 in **toEqual** to 0 and your test should pass now.

For the **failed** unit test add the following:

    it('fails correctly', function() {
        AjaxStubRequest(sys.testUrl, sys.body, 500);

        spyOn(MyTestActions.load, 'completed');
        spyOn(RenderActions, 'postRequestErr');

        MyTestActions.load();
        jasmine.clock().tick(); // allow action to be handled

        expect(MyTestActions.load.completed.calls.count()).toEqual(0);
        expect(RenderActions.postRequestErr.calls.count()).toEqual(1);
    });

Notice that in this case we are calling **AjaxStubRequest** with a response error code (i.e. 500).

Now, save the file:

    Test Suite For MyTestActions
      ✔ completes correctly
      ✔ fails correctly

Congratulations! You've just unit tested you new Actions!

Keep in mind that all Actions, Stores and utility modules should have full unit tests.
