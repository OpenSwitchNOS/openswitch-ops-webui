/*
 * Port Component to generate the single port graphic
 * @author Kelsey Dedoshka
 */

var React = require('react'),
    PropTypes = React.PropTypes;

// Main Component
module.exports = React.createClass({

    displayName: 'Port',

    propTypes: {
        size: PropTypes.string
    },

    render: function() {

        // If Size is small - generate smaller version of
        // the graphic. Defaults to larger size
        var size = this.props.size;
        return (
            <div className="portComponent">
                <div className= {'portGraphicBase ' + size}>
                    <div className={'portGraphicTier1 ' + size}></div>
                    <div className={'portGraphicTier2 ' + size}></div>
                    <div className={'portGraphicInnerBase ' + size}>
                        <table className={'prongTable ' + size}>
                            <tr>
                                <td><div className={'prong ' + size}></div></td>
                                <td><div className={'prong ' + size}></div></td>
                                <td><div className={'prong ' + size}></div></td>
                                <td><div className={'prong ' + size}></div></td>
                                <td><div className={'prong ' + size}></div></td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
});
