/*
 * Status with text (can be used for values in the PropTable).
 * @author Frank Wood
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
