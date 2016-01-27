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
 * An icons that can be used to invoke an action and be disabled.
 * This works for both grommet and font-awesome icons. Can be used by the
 * ViewBoxHeader's toolbar.
 */

var React = require('react'),
    PropTypes = React.PropTypes,
    ClassNames = require('classnames');

module.exports = React.createClass({

    displayName: 'ActionIcon',

    propTypes: {
        fa: PropTypes.string,
        icon: PropTypes.element,
        onClick: PropTypes.func,
        className: PropTypes.string
    },

    render: function() {
        var cls;

        if (this.props.icon) {
            cls = ClassNames(
                'actionIcon',
                this.props.className,
                { disabled: !this.props.onClick }
            );

            return (
                <span onClick={this.props.onClick} className={cls} >
                    {this.props.icon}
                </span>
            );
        }

        cls = ClassNames(
            'actionIcon',
            this.props.className,
            'fa',
            'fa-' + this.props.fa,
            { disabled: !this.props.onClick }
        );

        return ( <i onClick={this.props.onClick} className={cls} /> );
    }

});
