/*
 * An icons that can be used to invoke an action and be disabled.
 * This works for both grommet and font-awesome icons. Can be used by the
 * ViewBoxHeader's toolbar.
 * @author Frank Wood
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
