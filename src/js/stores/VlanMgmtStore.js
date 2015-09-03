/*
 * @author Frank Wood
 * @author Kelsey Dedoshka
 */

var Reflux = require('reflux'),
    React = require('react'),
    GEditIcon = require('grommet/components/icons/Edit'),
    VlanMgmtActions = require('VlanMgmtActions'),
    _ = require('lodash');

module.exports = Reflux.createStore({

    listenables: [ VlanMgmtActions ],

    // Data model VLAN data, colors, and graphic config
    state: {
        vlans: {},
        allVlans: {},
        vlansGraphic: {},
        colors: [
                { 'accent': '#FF6F3E', 'main': '#FF9E7D' },
                { 'accent': '#6539A4', 'main': '#9B78CF' },
                { 'accent': '#3B7690', 'main': '#66A8C4' },
                { 'accent': '#D39A42', 'main': '#E3BA7B' }
            ],
        vlanDisplay: {},
        boxPortConfig: {
            showVlans: true,
            data: {},
        },
        selectedVlan: -1,
        colorIndexes: [false, false, false, false],
        numberOfSelectedVlans: 0,
        portDetails: { 'show': false, 'port': 0 },
        showStatusText: 0
    },

    // initialize the store.
    getInitialState: function() {
        this.state.boxPortConfig.colors = this.state.colors;
        return this.state;
    },

    // parse the response into allVlans for the VLAN table
    parseVlanResponse: function(res) {
        var pcfg = res.body.configuration,
            psts = res.body.status,
            vlanData = {};

        vlanData.id = pcfg.id;
        vlanData.name = pcfg.name;
        vlanData.operState = psts.oper_state;
        vlanData.reason = psts.oper_state_reason;

        return vlanData;
    },

    // Callback for success of loading vlan data
    onLoadVlansCompleted: function(res) {
        var index,
            trunkVlans,
            vlans = {};

        // loop through returned vlans are create
        // entries in the object
        for (var i=0; i<res.length; i++) {
            for (var idx=0; idx<res[i].length; idx++) {
                var elem = res[i][idx];
                // id in elem - the data set is a vlan
                // vlan_mode in elem - data set is a port
                // confgured on a vlan
                //FIXME - find a better way to determine which of these indicates
                // ports and vlans
                var cfg = elem.body.configuration;
                if ('id' in cfg) {
                    // parse the response for keys needed in view
                    vlans[cfg.id] = this.parseVlanResponse(elem);
                    vlans[cfg.id].ports = [];
                } else if ('vlan_mode' in cfg) {

                    // make sure the trunk array is not empty
                    if (cfg.trunks !== []) {
                        trunkVlans = cfg.trunks;

                        // get the trunk vlans from trunk array
                        for (var j=0; j<trunkVlans.length; j++) {
                            index = Number(trunkVlans[j]);
                            if (vlans[index]) {
                                vlans[index].ports = vlans[index].ports || [];
                                vlans[index].ports.push(cfg.name);
                            }
                        }
                    }

                    // if the port vlan is not a trunk then the
                    // vlan id is in the tag key
                    index = Number(cfg.tag);
                    if (vlans[index]) {
                        vlans[index].ports = vlans[index].ports || [];
                        vlans[index].ports.push(cfg.name);
                    }
                }
            }
        }

        // initialize the vlanDisplay data with the vlan data that is returned
        for (var key in vlans) {
            if (vlans.hasOwnProperty(key)) {
                this.state.vlanDisplay[vlans[key].id] = {
                    data: vlans[key],
                    show: false,
                    colorIndex: null,
                    toolbar: <GEditIcon />,
                    toolbarDisabled: 0,
                    editDisplayState: 0,
                    keyContent: null
                };

            }
        }

        this.state.vlans = vlans;
        this.state.vlansGraphic = _.cloneDeep(vlans);
        this.loadBoxGraphic(vlans);

        // if there are no vlans set the status text. Set this here
        // so that the user does not see the warning message for a
        // few seconds as the data loads
        if (Object.keys(vlans).length === 0 ) {
            this.state.showStatusText = 1;
        }

        this.trigger(this.state);
    },

    // Load the box graphic data with the list of vlans passed in
    loadBoxGraphic: function(vlans) {
        this.state.boxPortConfig.data = {};

        // create boxPortConfig object which includes -
        // all ports in the graphic each indicating which VLANs
        // they belong to and the state of display
        for (var key in vlans) {
            if (vlans.hasOwnProperty(key)) {

                // need to check to make sure there are actually
                // ports on the vlan before attempting to create
                // the data
                var data = vlans[key].ports;
                for (var i=0; i<data.length; i++) {
                    var port = data[i];
                    if (port in this.state.boxPortConfig.data) {
                        this.state.boxPortConfig.data[port].vlans
                            .push(vlans[key].id);
                    } else {
                        this.state.boxPortConfig.data[port] =
                            { 'vlans': [vlans[key].id],
                                'status': false };
                    }
                }
            }
        }
    },

 // Handler for when a user checks a VLAN to display in the graphic
    onToggleVlanDisplay: function(id, checked) {

        //set the color index to a valid index: (0-4);
        if (checked) {

            // update the number of selected vlans - Max is 4 to display
            this.state.numberOfSelectedVlans = this.state.numberOfSelectedVlans + 1;

            for (var i=0; i<this.state.colorIndexes.length; i++) {
                if (!this.state.colorIndexes[i]) {
                    this.state.vlanDisplay[id].colorIndex = i;
                    this.state.colorIndexes[i] = true;
                    break;
                }
            }
        } else {

            //update number of selected vlans
            this.state.numberOfSelectedVlans = this.state.numberOfSelectedVlans - 1;

            var index = this.state.vlanDisplay[id].colorIndex;
            this.state.colorIndexes[index] = false;
        }

        this.state.vlanDisplay[id].show = checked;
        for (var key in this.state.boxPortConfig.data) {
            if (this.state.boxPortConfig.data[key].vlans.indexOf(Number(id)) > -1) {
                this.state.boxPortConfig.data[key].status = checked;
            }
        }

        this.trigger(this.state);
    },

    onShowPortDetails: function(port) {
        this.state.portDetails.show = true;
        this.state.portDetails.port = port;
        this.trigger(this.state);
    },

    onClosePortDetails: function() {
        this.state.portDetails.show = false;
        this.state.portDetails.port = 0;
        this.trigger(this.state);
    },

    //handler to rest necessary store data when
    //the component unmounts
    onResetStore: function() {
        this.state.colorIndexes = [false, false, false, false];
        this.state.numberOfSelectedVlans = 0;
        this.trigger(this.state);
    }

});
