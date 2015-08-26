/*
 * ColorBlock component is a collar wrapper around an icon
 * or graphic to indicate a color for a key
 * @author Kelsey Dedoshka
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
            <div className={'accentColor' + this.props.size}
                     style={accentStyle}>
                <div className={'mainColor' + this.props.size}
                        style={mainStyle}>
                    <div className={'triangle' + this.props.size}
                        style={mainTri}>
                    </div>
                </div>
            </div>

        );
    }
});
