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
 * Status with text (can be used for values in the PropTable).
 */

var React = require('react'),
    PropTypes = React.PropTypes,
    GStatus = require('grommet/components/icons/Status');

module.exports = React.createClass({

    displayName: 'StatusText',

    propTypes: {
        value: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired
    },

    render: function() {
        return (
            <span className="statusText">
                <GStatus value={this.props.value}/>
                <span>&nbsp;&nbsp;{this.props.text}</span>
            </span>
        );
    }

});
