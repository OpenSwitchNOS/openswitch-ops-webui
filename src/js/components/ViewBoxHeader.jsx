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
 * Provides the header for a view box.
 */

var React = require('react'),
    PropTypes = React.PropTypes;

module.exports = React.createClass({

    displayName: 'ViewBoxHeader',

    propTypes: {
        title: PropTypes.node.isRequired,
        toolbar: PropTypes.object
    },

    render: function() {
        var tb = this.props.toolbar,
            icons;

        if (tb) {
            icons = Object.keys(tb).map(function(key) {
                return (
                    <span key={key}>
                        {tb[key]}
                    </span>
                );
            });
        }

        return (
            <div className="viewBoxHeader headerFont">
                {this.props.title}
                <span className="flexIcons">{icons}</span>
            </div>
        );
    }

});
