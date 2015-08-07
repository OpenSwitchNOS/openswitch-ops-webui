/*
 * Test view.
 * @author Frank Wood
 */

var React = require('react'),
    I18n = require('i18n'),
    ActionIcon = require('ActionIcon'),
    ViewBoxHeader = require('ViewBoxHeader'),
    GHelpIcon = require('grommet/components/icons/Help');

module.exports = React.createClass({

    displayName: 'TestView',

    onClickHelp: function() {
        alert('Clicked help.');
    },

    render: function() {

        var helpTb = {
            help: <ActionIcon icon=<GHelpIcon /> onClick={this.onClickHelp} />
        };

        function t(key) {
            return I18n.text('views.test1.' + key);
        }

        return (
            <div className="viewFill viewCol">

                <div className="viewRow viewFlex0">

                    <div className="viewBox">
                        <ViewBoxHeader title={t('r1c1hdr')} />
                        {t('desc')}
                    </div>

                    <div className="viewCol">
                        <div className="viewRow">
                            <div className="viewBox">
                                <ViewBoxHeader title={t('r1c2r1b1hdr')} />
                            </div>
                            <div className="viewBox">
                                <ViewBoxHeader title={t('r1c2r1b2hdr')} />
                            </div>
                        </div>
                        <div className="viewRow">
                            <div className="viewBox">
                                <ViewBoxHeader title={t('r1c2r2b1hdr')} />
                            </div>
                            <div className="viewBox">
                                <ViewBoxHeader title={t('r1c2r2b2hdr')} />
                            </div>
                        </div>
                    </div>

                </div>

                <div className="viewRow viewFlex1">
                    <div className="viewBox viewFlex1">
                        <ViewBoxHeader title={t('r2c1hdr')}
                            toolbar={helpTb} />
                    </div>
                    <div className="viewBox viewFlex1">
                        <ViewBoxHeader title={t('r2c2hdr')}
                            toolbar={helpTb} />
                    </div>
                </div>

            </div>
        );

    }

});
