/*
 * Tile panel that contains header text, content and an optional edit button.
 * @author Kelsey Dedoshka
 */

var React = require('react');

module.exports = React.createClass({

    displayName: 'Port',

    render: function() {
        return (
            <div className="portGraphicBase">
                <div className="portGraphicTier1"></div>
                <div className="portGraphicTier2"></div>
                <div className="portGraphicInnerBase">
                    <table className="prongTable">
                        <tr>
                            <td><div className="prong"></div></td>
                            <td><div className="prong"></div></td>
                            <td><div className="prong"></div></td>
                            <td><div className="prong"></div></td>
                            <td><div className="prong"></div></td>
                        </tr>
                    </table>
                </div>
            </div>
        );
    }
});
