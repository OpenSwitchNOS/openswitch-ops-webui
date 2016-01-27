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
 * System monitor view.
 */

var React = require('react'),
    I18n = require('i18n'),
    ViewBoxHeader = require('ViewBoxHeader'),
    GMenu = require('grommet/components/Menu'),
    Router = require('react-router'),
    RouteHandler = Router.RouteHandler,
    Link = Router.Link,
    ViewInitMixin = require('ViewInitMixin');

function t(key) {
    return I18n.text('views.systemMonitor.' + key);
}

module.exports = React.createClass({

    displayName: 'SystemMonitorView',

    mixins: [
        Router.Navigation,
        Router.State,
        ViewInitMixin
    ],

    componentWillMount: function() {
        if (!this.getParams().type) {
            this.transitionTo('/systemMonitor/cpu');
        }
    },

    mkLink: function(type) {
        return (
            <Link to={'/systemMonitor/' + type}>
                {t(type)}
            </Link>
        );
    },

    render: function() {
        return (
            <div id="systemMonitorView" className="viewFill viewCol">
                <div className="viewRow">
                    <div className="viewBox viewFlex1">
                        <ViewBoxHeader title=
                            <GMenu direction="row">
                                {this.mkLink('cpu')}
                                {this.mkLink('memory')}
                                {this.mkLink('temperature')}
                            </GMenu>
                        />
                        <RouteHandler />
                    </div>
                </div>
            </div>
        );
    }

});
