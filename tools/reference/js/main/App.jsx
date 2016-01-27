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
 * Top-level component that creates the appliction.
 */

var React = require('react/addons'),
    ReactCSSTransitionGroup = React.addons.CSSTransitionGroup,
    Router = require('react-router'),
    RouteHandler = Router.RouteHandler,
    Reflux = require('reflux'),
    RenderActions = require('RenderActions'),
    RenderStore = require('RenderStore'),
    Mast = require('Mast'),
    NavPane = require('NavPane'),
    ClassNames = require('classnames'),
    Notification = require('Notification'),
    QueryString = require('query-string'),
    RestUtils = require('restUtils');

var MAX_AUTO_CLOSE_NAV_WIDTH = 1024;

module.exports = React.createClass({

    displayName: 'App',

    mixins: [
        Reflux.connect(RenderStore, 'render'),
        Router.State
    ],

    componentWillMount: function() {
        var qs = QueryString.parse(location.search);
        if (qs && qs.restapi) {
            RestUtils.setRestApiRedirect(qs.restapi);
        }

        if (this.shouldAutoCloseNavPane()) {
            RenderActions.hideNavPane();
        }
    },

    componentDidMount: function() {
        window.addEventListener('resize', this.resize);
    },

    componentWillUnmount: function() {
        window.removeEventListener('resize', this.resize);
    },

    resize: function() {
        if (this.shouldAutoCloseNavPane()) {
            RenderActions.hideNavPane();
        }
    },

    shouldAutoCloseNavPane: function() {
        var dim = this.calcDimensions();
        return dim.width <= MAX_AUTO_CLOSE_NAV_WIDTH;
    },

    calcDimensions: function() {
        var ww = window.innerWidth,
            wh = window.innerHeight,
            cw = document.documentElement.clientWidth,
            ch = document.documentElement.clientHeight,
            newWidth, newHeight;

        newWidth = ww && cw ? Math.min(ww, cw) : ww || cw ||
            document.getElementsByTagName('body')[0].clientWidth;

        newHeight = wh && ch ? Math.min(wh, ch) : wh || ch ||
            document.getElementsByTagName('body')[0].clientHeight;

        return { width: newWidth, height: newHeight };
    },

    render: function() {

        var showNav = this.state.render.showNavPane,
            err = this.state.render.requestErr,
            cls = ClassNames({ navPaneShown: showNav }),
            autoClose = this.shouldAutoCloseNavPane();

        return (
            <div>
                <Mast />

                <ReactCSSTransitionGroup transitionName="navPaneTrans">
                    {showNav ?
                        <NavPane autoClose={autoClose} /> : null}
                </ReactCSSTransitionGroup>

                <div id="viewPane" className={cls}>
                    <RouteHandler />
                </div>

                {err ? <Notification requestErr={err} /> : null}
            </div>
        );
    }
});
