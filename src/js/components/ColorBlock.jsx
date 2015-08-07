/*
 * Tile panel that contains header text, content and an optional edit button.
 * @author Kelsey Dedoshka
 */

var React = require('react'),
    PropTypes = React.PropTypes;

module.exports = React.createClass({

    displayName: 'ColorBlock',

    propTypes: {
        accent: PropTypes.string.isRequired,
        main: PropTypes.string.isRequired
    },

    render: function() {

        var accentStyle = {
            backgroundColor: this.props.accent
        };

        var mainStyle = {
            backgroundColor: this.props.main
        };

        var mainTri = {
            borderLeftColor: this.props.main
        };

        return (
            <div className="accentColor" style={accentStyle}>
                <div className="mainColor" style={mainStyle}>
                    <div className="triangle" style={mainTri}></div>
                </div>
            </div>
        );
    }
});
