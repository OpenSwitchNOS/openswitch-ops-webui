/*
 * The store for VLANs.
 * @author Frank Wood
 */

var Reflux = require('reflux'),
    React = require('react'),
    GEditIcon = require('grommet/components/icons/Edit'),
    VlansActions = require('VlansActions');

module.exports = Reflux.createStore({

    // I want callbacks on these actions.
    listenables: [ VlansActions ],

    // Data model VLANs and colors.
    state: {
        vlans: [],
        colors: [
                { 'main': '#AC92EC', 'accent': '#6B50AD' },
                { 'main': '#6AB5DE', 'accent': '#2D84B3' },
                { 'main': '#F5D16E', 'accent': '#C7A23C' },
                { 'main': '#FE9966', 'accent': '#C76332' }
            ],
        vlanDisplay: [],
        boxPortConfig: {},
        selectedVlan: -1
    },

    // Can be used to initialize users of this store.
    getInitialState: function() {
        return this.state;
    },

    onLoadVlansCompleted: function(vlans) {

        for (var i=0; i<vlans.length; i++) {
            this.state.vlanDisplay[vlans[i].id] = { name: vlans[i].name,
                                                    show: 0,
                                                    id: vlans[i].id,
                                                    data: vlans[i],
                                                    colorIndex: i,
                                                    toolbar: <GEditIcon/>,
                                                    editDisplayState: 0 };
        }

        this.loadBoxGraphic(vlans);
        this.state.vlans = vlans;
        this.trigger(this.state);
    },

    // Callback for VlanActions.loadVlansCompleted
    loadBoxGraphic: function(vlans) {
        this.state.boxPortConfig = {};

        for (var l=0; l<vlans.length; l++) {
            var data = vlans[l].all;
            for (var j=0; j<data.length; j++) {
                var value = data[j];
                if (value in this.state.boxPortConfig) {
                    this.state.boxPortConfig[value].vlans.push(vlans[l].id);
                } else {
                    this.state.boxPortConfig[value] = { 'vlans': [vlans[l].id],
                                                        'status': false };
                }
            }
        }

    },

    onToggleVlanDisplay: function(id) {
        this.state.vlanDisplay[id].show = !(this.state.vlanDisplay[id].show);

        for (var key in this.state.boxPortConfig) {
            if (this.state.boxPortConfig[key].vlans.indexOf(Number(id)) > -1) {
                this.state.boxPortConfig[key].status =
                    !(this.state.boxPortConfig[key].status);
            }
        }

        this.trigger(this.state);
    },

    onSetSelectedVlan: function(id, editIcon, displayState) {
        var index;
        if (id === -1) {
            index = this.state.selectedVlan;
        } else {
            index = id;
        }
        this.state.vlanDisplay[index].toolbar = editIcon;
        this.state.vlanDisplay[index].editDisplayState = displayState;
        this.state.selectedVlan = id;
        this.trigger(this.state);
    },

    onAddPortToVlan: function(port) {

        var vlans = this.state.vlans;
        for (var i=0; i<vlans.length; i++) {
            if (vlans[i].id === this.state.selectedVlan) {
                vlans[i].all.push(port);
            }
        }

        this.loadBoxGraphic(vlans);
        this.trigger(this.state);
    },

    onRemovePortFromVlan: function(port) {

        var vlans = this.state.vlans;
        for (var i=0; i<vlans.length; i++) {
            if (vlans[i].id === this.state.selectedVlan) {
                var index = vlans[i].all.indexOf(port);
                if (index > -1) {
                    vlans[i].all.splice(index, 1);
                }
            }
        }

        this.loadBoxGraphic(vlans);
        this.trigger(this.state);
    },

    onSaveVlanConfig: function() {
        //this.loadBoxGraphic(this.state.vlans);
        //this.trigger(this.state);
    }
});
