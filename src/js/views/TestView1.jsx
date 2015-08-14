/*
 * Test view.
 * @author Frank Wood
 */

var React = require('react'),
    I18n = require('i18n'),
    ActionIcon = require('ActionIcon'),
    ViewBoxHeader = require('ViewBoxHeader'),
    GHelpIcon = require('grommet/components/icons/Help'),
    ReactShuffle = require('react-shuffle');

module.exports = React.createClass({

    displayName: 'TestView',

    getInitialState: function() {
        return {
            filter: false,
            lines: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
        };
    },

    onClickHelp: function() {
        alert('Clicked help.');
    },

    nextRnd: function(newLines) {
        var rnd;
        do {
            rnd = Math.floor((Math.random() * 10) + 1);
        } while (newLines.indexOf(rnd) >= 0);
        return rnd;
    },

    mkLines: function(filter) {
        var newLines = [];
        newLines.push(this.nextRnd(newLines));
        newLines.push(this.nextRnd(newLines));
        newLines.push(this.nextRnd(newLines));
        newLines.push(this.nextRnd(newLines));
        newLines.push(this.nextRnd(newLines));
        if (!filter) {
            newLines.push(this.nextRnd(newLines));
            newLines.push(this.nextRnd(newLines));
            newLines.push(this.nextRnd(newLines));
            newLines.push(this.nextRnd(newLines));
            newLines.push(this.nextRnd(newLines));
        }
        return newLines;
    },

    onClickChange: function() {
        this.setState({
            lines: this.mkLines()
        });
    },

    onClickMinus: function() {
        var newFilter = !this.state.filter;
        this.setState({
            filter: newFilter,
            lines: this.mkLines(newFilter),
        });
    },

    render: function() {

        var helpTb = {
            change: <ActionIcon fa="gear" onClick={this.onClickChange} />,
            minus: <ActionIcon fa="minus" onClick={this.onClickMinus} />,
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

                        <ReactShuffle duration={1500} scale={false} fade={true}>
                            { this.state.lines.map(function(num) {
                                var key = 'key' + num;
                                return (
                                    <div key={key}>
                                        {key + ' (click above reorder/filter)'}
                                    </div>
                                );
                            })}
                        </ReactShuffle>

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
