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
 * ColorBlock component is a collar wrapper around an icon
 * or graphic to indicate a color for a key
 */

var React = require('react'),
    PropTypes = React.PropTypes;


// Main component
module.exports = React.createClass({

    displayName: 'ColorBlock',

    propTypes: {
        accent: PropTypes.string.isRequired,
        main: PropTypes.string.isRequired,
        size: PropTypes.string.isRequired
    },

    render: function() {

        // style for the accent color
        var accentStyle = {
            backgroundColor: this.props.accent
        };

        // style for the main color
        var mainStyle = {
            backgroundColor: this.props.main
        };

        // style for the main triangle
        var mainTri = {
            borderLeftColor: this.props.main
        };

        return (
            <div className='colorBlockComponent'>
                <div className={'accentColor ' + this.props.size}
                    style={accentStyle}>
                    <div className={'mainColor ' + this.props.size}
                        style={mainStyle}>
                        <div className={'triangle ' + this.props.size}
                            style={mainTri}>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});
