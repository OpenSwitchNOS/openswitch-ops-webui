/*
 * Test view #2.
 * @author Frank Wood
 */

var React = require('react'),
    I18n = require('i18n'),
    ActionIcon = require('ActionIcon'),
    ViewBoxHeader = require('ViewBoxHeader');

module.exports = React.createClass({

    displayName: 'TestView2',

    onClickTb: function() {
        alert('Clicked toolbar icon.');
    },

    render: function() {

        var tb1 = {
                tb1Wrench: <ActionIcon fa="wrench" />,
                tb2Chart: <ActionIcon fa="area-chart"
                    onClick={this.onClickTb} />
            };

        function t(key) {
            return I18n.text('views.test2.' + key);
        }

        return (
            <div className="viewFill viewCol">

                <div className="viewRow">
                    <div className="viewBox">
                        <ViewBoxHeader title={t('r1b1hdr')} />
                        {t('desc')}
                    </div>
                    <div className="viewBox">
                        <ViewBoxHeader title={t('r1b2hdr')}
                            toolbar={tb1} />
                    </div>
                    <div className="viewBox">
                        <ViewBoxHeader title={t('r1b3hdr')} />
                    </div>
                </div>

                <div className="viewRow viewFlex1">
                    <div className="viewBox viewFlex1">
                        <ViewBoxHeader title={t('r2b1hdr')}
                            toolbar={tb1} />
                    </div>
                    <div className="viewBox viewFlex1">
                        <ViewBoxHeader title={t('r2b2hdr')}
                            toolbar={tb1} />
                    </div>
                </div>

            </div>
        );
    }

});
