/*
 * Check Box Component
 * @author Kelsey Dedoshka
 */

var React = require('react'),
    PropTypes = React.PropTypes;

module.exports = React.createClass({

    displayName: 'CheckBox',

    propTypes: {
        disabled: PropTypes.bool,
        onChange: PropTypes.func,
        id: PropTypes.string.isRequired,
        checked: PropTypes.bool
    },

    render: function() {
        return (
            <div className="checkBox__component">
                <input
                    id={this.props.id} type="checkbox"
                    checked={this.props.checked}
                    onChange={this.props.onChange}
                    disabled={this.props.disabled ? 'disabled' : null}
                />
                <label htmlFor={this.props.id}></label>
            </div>
        );
    }
});
