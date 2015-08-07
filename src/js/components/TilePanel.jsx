/*
 * Tile panel that contains header text, content and an optional edit button.
 * @author Kelsey Dedoshka
 * @author Frank Wood
 */

var React = require('react'),
    PropTypes = React.PropTypes,
    GHdr = require('grommet/components/Header');

module.exports = React.createClass({

    displayName: 'TilePanel',

    propTypes: {
        title: PropTypes.string,
        toolbar: PropTypes.object,
        onClickIcon: PropTypes.func,
        children: PropTypes.node.isRequired
    },

    onClickToolbarIcon: function(actionName) {
        this.props.onClickIcon(actionName);
    },

    render: function() {
        var title = this.props.title,
            toolbar = this.props.toolbar,
            showHdr = title || toolbar,
            hdr,
            sep;

        if (showHdr) {
            var iconElms;
            if (toolbar) {
                var cb = this.onClickToolbarIcon;
                iconElms = Object.keys(toolbar).map(function(key) {
                    var elm = toolbar[key],
                        fn = function() { cb(key); };
                    return ( <span key={key} onClick={fn}>{elm}</span> );
                });
            }
            hdr = <GHdr small={true}>{title}<span>{iconElms}</span></GHdr>;
            sep = <hr />;
        }

        return (
            <div className="tilePanel">
                {hdr}
                {sep}
                <div>{this.props.children}</div>
            </div>
        );
    }

});
