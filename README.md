Install:
--------

Verify:

>node -v
v0.10.25
>npm -v
1.3.10

Setup Proxy:

>npm config set http-proxy http://web-proxy.rose.hp.com:8088
>npm config set https-proxy http://web-proxy.rose.hp.com:8088

Pull Dependencies:

>cd ../nextgenweb/webapp
>npm install

Usage:
------

See 'package.json' - commands are under "scripts".
You run them using "npm run <script-command>"

For example:
>npm run build
>npm run start

...or use the ./aliases.sh script.

TODO:
-----

-grommet adding external URLs?
    node_modules/grommet/scss/grommet-core/_base.font.scss - url(http:...)
-unit test stores
-look at extract-text-webpack-plugin
-coverage plug-in for karma
-jasmine vs mocha for testing
