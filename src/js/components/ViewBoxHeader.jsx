/*
 * Provides the header for a view box.
 * @author Kelsey Dedoshka
 * @author Frank Wood
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
            <div className="viewBoxHeader">
                {this.props.title}
                <div className="flexIcons">{icons}</div>
            </div>
        );
    }

});
