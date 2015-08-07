/*
 * Test view #3.
 * @author Frank Wood
 */

var React = require('react'),
    I18n = require('i18n'),
    ViewBoxHeader = require('ViewBoxHeader'),
    ActionIcon = require('ActionIcon'),
    GHelpIcon = require('grommet/components/icons/Help'),
    GEditIcon = require('grommet/components/icons/Edit');

module.exports = React.createClass({

    displayName: 'TestView3',

    onChartAction: function() {
        alert('Clicked chart icon.');
    },

    onHelpAction: function() {
        alert('Clicked help icon.');
    },

    render: function() {

        var tb1 = {
                tb1Wrench: <ActionIcon
                    fa="wrench"
                />,
                tb1Chart: <ActionIcon
                    fa="area-chart"
                    onClick={this.onChartAction}
                />
            },
            tb2 = {
                tb2Chart: <ActionIcon
                    fa="area-chart"
                />,
                tb2Edit: <ActionIcon
                    icon=<GEditIcon />
                />,
                tb2Help: <ActionIcon
                    icon=<GHelpIcon />
                    onClick={this.onHelpAction}
                />
            };

        function t(key) {
            return I18n.text('views.test3.' + key);
        }

        return (
            <div className="viewFill viewRow">

                <div className="viewBox viewFlex1">
                    <ViewBoxHeader title={t('c1hdr')}
                        toolbar={tb1} />
                    {t('desc')}
                </div>

                <div className="viewCol viewFlex2">
                    <div className="viewRow">
                        <div className="viewBox">
                            {t('c1b1')}
                        </div>
                        <div className="viewBox">
                            {t('c1b2')}
                        </div>
                        <div className="viewBox">
                            {t('c1b3')}
                        </div>
                    </div>
                    <div className="viewBox viewFlex1">
                        {t('c2r2')}
                    </div>
                    <div className="viewBox viewFlex2">
                        <ViewBoxHeader title={t('c2r3hdr')}
                            toolbar={tb2} />
                    </div>
                </div>

            </div>
        );

    }

});
