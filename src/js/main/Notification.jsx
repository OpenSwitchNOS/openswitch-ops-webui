/*
 * Top-level notification component for the appliction.
 * @author Kelsey Dedoshka
 * @author Frank Wood
 */

var React = require('react/addons'),
    I18n = require('i18n'),
    RenderActions = require('RenderActions'),
    GLayer = require('grommet/components/Layer'),
    GFooter = require('grommet/components/Footer'),
    GButton = require('grommet/components/Button');

module.exports = React.createClass({

    displayName: 'Notification',

    propTypes: {
        requestErr: React.PropTypes.shape({
            message: React.PropTypes.string.isRequired,
            reqUrl: React.PropTypes.string.isRequired
        })
    },

    mkContent: function() {
        var err = this.props.requestErr;
        return (
            <div>
                <div>
                    <b>{I18n.text('errMsg') + ': '}</b>
                    {err.message}
                </div>
                <br />
                <div>
                    <i>
                        ({I18n.text('errReqUrl') + ': ' + err.reqUrl})
                    </i>
                </div>
                <br />
                <br />
                <br />
            </div>
        );
    },

    // TODO: Is this wack...gotta do better here
    close: function() {
        if (this.props.requestErr) {
            RenderActions.clearRequestErr();
        }
    },

    // TODO: clicking anywhere on the layer closes it
    render: function() {
        var closeTxt = I18n.text('close');

        return (
            <GLayer className="appNotificationLayer"
                closer={true}
                onClose={this.close}>

                {this.mkContent()}

                <hr/>

                <GFooter>
                    <GButton
                        primary={true}
                        label={closeTxt}
                        onClick={this.close} />
                </GFooter>

            </GLayer>
        );
    }
});
