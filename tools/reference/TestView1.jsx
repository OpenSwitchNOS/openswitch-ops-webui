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

var NUM_SLOTS_VIEWABLE = 5,
    NUM_SLOTS = NUM_SLOTS_VIEWABLE * 2,
    NUM_DATA_IDS = 15;

module.exports = React.createClass({

    displayName: 'TestView',

    getInitialState: function() {
        var slots = [];
        for (var i=0; i<NUM_SLOTS; i++) {
            slots.push( { key: 'k' + i, init: true, val: 0 } );
        }
        return {
            slots: slots
        };
    },

    componentDidMount: function() {
        setTimeout(this.clearSlotsInit, 500);
    },

    clearSlotsInit: function() {
        var slots = this.state.slots;
        for (var i=0; i<slots.length; i++) {
            delete slots[i].init;
        }
        this.setState( { slots: slots } );
    },

    rndDataIds: function(count) {
        var rndId,
            ids = [];
        for (var i=0; i<count; i++) {
            do {
                rndId = Math.floor((Math.random() * NUM_DATA_IDS) + 1);
            } while (0 <= ids.indexOf(rndId));
            ids.push(rndId);
        }
        return ids;
    },

    rndDataVals: function(count) {
        var vals = [];
        for (var i=0; i<count; i++) {
            vals.push(Math.floor((Math.random() * 100) + 1));
        }
        return vals;
    },

    findSlotIdx: function(id) {
        var slots = this.state.slots,
            i;
        // use existing slot if there is one
        for (i=0; i<slots.length; i++) {
            if (slots[i].id === id) {
                return i;
            }
        }
        // use first free slot
        for (i=0; i<slots.length; i++) {
            if (!slots[i].id) {
                return i;
            }
        }
        return -1;
    },

    // Simultate new data items arriving.
    onClickPlus: function() {
        var slots = this.state.slots,
            dataIds = this.rndDataIds(NUM_SLOTS_VIEWABLE),
            dataVals = this.rndDataVals(NUM_SLOTS_VIEWABLE),
            i, id, val, slotIdx;

        // clear all values (new data arriving).
        for (i=0; i<slots.length; i++) {
            slots[i].val = 0;
        }

        for (i=0; i<NUM_SLOTS_VIEWABLE; i++) {
            id = dataIds[i];
            val = dataVals[i];
            slotIdx = this.findSlotIdx(id);
            if (slotIdx >= 0) {
                slots[slotIdx].id = id;
                slots[slotIdx].val = val;
            }
        }

        // sort the slots based on the data val
        slots = slots.sort(function(a, b) {
            return b.val - a.val;
        });

        // clear out IDS of not viewable slots
        for (i=NUM_SLOTS_VIEWABLE; i<NUM_SLOTS; i++) {
            delete slots[i].id;
        }

        this.setState({
            slots: slots
        });
    },

    mkShuffleItems: function() {
        var divs = [],
            slots = this.state.slots,
            slot;
        for (var i=0; i<slots.length; i++) {
            slot = slots[i];
            if (slot.init) {
                divs.push(
                    <div style={{ display: 'none' }} key={slot.key} />
                );
            } else if (slot.id) {
                divs.push(
                    <div key={slot.key}>
                        {
                            'id:' + slot.id + ' val:' + slot.val +
                            ' key:' + slot.key
                        }
                    </div>
                );
            }
        }
        return divs;
    },

    onClickHelp: function() {
        alert('Clicked help.');
    },

    render: function() {

        var helpTb = {
            plus: <ActionIcon fa="plus" onClick={this.onClickPlus} />,
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
                            { this.mkShuffleItems() }
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
