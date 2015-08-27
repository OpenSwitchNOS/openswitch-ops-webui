/*
 * VLAN view.
 * @author Kelsey Dedoshka
 */

var React = require('react'),
    PropTypes = React.PropTypes,
    Reflux = require('reflux'),
    I18n = require('i18n'),
    GTable = require('grommet/components/Table'),
    GCheckBox = require('grommet/components/CheckBox'),
    GEditIcon = require('grommet/components/icons/Edit'),
    ViewBoxHeader = require('ViewBoxHeader'),
    BoxGraphic = require('BoxGraphic'),
    VlansActions = require('VlansActions'),
    VlansStore = require('VlansStore'),
    DISPLAY_STATE = 0,
    EDIT_STATE = 1;


// FIXME: localize the display strings.

var AllVlansTable = React.createClass({

    displayName: 'AllVlansTable',

    mixins: [ Reflux.connect(VlansStore, 'data') ],

    toggleVlanDisplay: function(e) {
        VlansActions.toggleVlanDisplay(e.target.id);
    },

    render: function() {
        return (
            <GTable className="defaultTable">
                <thead>
                    <th>Name</th>
                    <th>ID</th>
                    <th>Untagged</th>
                    <th>Tagged</th>
                    <th>Access</th>
                    <th>Trunk</th>
                    <th>Display</th>
                </thead>
                <tbody>
                {this.state.data.vlans.map(function(vlan) {
                    return (
                        <tr key={vlan.id}>
                            <td>{vlan.name}</td>
                            <td>{vlan.id}</td>
                            <td>{vlan.untagged}</td>
                            <td>{vlan.tagged}</td>
                            <td>{vlan.access}</td>
                            <td>{vlan.trunk}</td>
                            <td><GCheckBox id={vlan.id}
                                onChange={this.toggleVlanDisplay}/></td>
                        </tr>
                    );
                }, this)}
                </tbody>
            </GTable>
        );
    }
});

/*var VlanKey = React.createClass({

    displayName: 'VlanKey',

    propTypes: {
        accent: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
        data: PropTypes.object.isRequired
    },

    // FIXME: localize text

    render: function() {
        return (
            <table>
                <tr>
                    <td>
                        <div className="vlanKeyContainer">
                            <div className="colorBlockKeyContainer">
                                <ColorBlock accent={this.props.accent}
                                            main={this.props.color}/>
                            </div>
                            <div className="portKeyContainer">
                                <Port/>
                            </div>
                        </div>
                    </td>
                    <td>
                        <table className="basicTable">
                            <tr>
                                <td>Tagged:</td>
                                <td>{this.props.data.tagged}</td>
                            </tr>
                            <tr>
                                <td>Untagged:</td>
                                <td>{this.props.data.untagged}</td>
                            </tr>
                            <tr>
                                <td>Access:</td>
                                <td>{this.props.data.access}</td>
                            </tr>
                            <tr>
                                <td>Trunk:</td>
                                <td>{this.props.data.trunk}</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        );
    }
});*/

var EditElement = React.createClass({

    displayName: 'EditElement',

    propTypes: {
        color: PropTypes.string.isRequired
    },

    mixins: [ Reflux.connect(VlansStore, 'data') ],

    saveVlanConfig: function() {
        VlansActions.saveVlanConfig();
    },

    render: function() {
        var style = { backgroundColor: this.props.color };
        return (
            <table className="editVlanTable">
                <tr>
                    <td>
                        <div style={style} className="editVlanSquare"></div>
                    </td>
                    <td className="editVlanTitle">Select Ports</td>
                    <td><i className="clickable fa fa-check"
                            onClick={this.saveVlanConfig}/></td>
                </tr>
            </table>
        );
    }
});


module.exports = React.createClass({

    displayName: 'VlansView',

    // Automatically subscribe/unsubscribe when mounting/unmounting.
    // Store will initialize our state from its 'getInitialState'.

    mixins: [ Reflux.connect(VlansStore, 'data') ],

    getInitialState: function() {
        return {
            selectedPort: 0
        };
    },

    componentDidMount: function() {
        VlansActions.loadVlans();
    },

    editVlan: function(id, displayState, color) {
        var vlanToSet;
        var editIcon;

        if (displayState === DISPLAY_STATE) {
            this.setState({
                selectedPort: id
            });
            vlanToSet = id;
            editIcon = <EditElement color={color.main} />;

        } else if (displayState === EDIT_STATE) {
            vlanToSet = -1;
            editIcon = <GEditIcon />;
        }
        VlansActions.setSelectedVlan(vlanToSet, editIcon, 1 - displayState);
    },

    isInSelectedVlan: function(num) {
        var data = this.state.data.vlans;
        for (var i=0; i< data.length; i++ ) {
            if (data[i].id === this.state.data.selectedVlan) {
                var ports = data[i].all;
                for (var j=0; j<ports.length; j++) {
                    if (ports[j] === num ) {
                        return true;
                    }
                }
            }
        }

        return false;
    },

    portSelected: function(num) {
        if (this.isInSelectedVlan(num)) {
            VlansActions.removePortFromVlan(num);
        } else if (this.state.data.selectedVlan !== -1) {
            VlansActions.addPortToVlan(num);
        }
    },

    render: function() {
        var t = I18n.text;
        return (
            <div className="viewFill viewCol">

                <div className="viewBox">
                    <ViewBoxHeader title={t('views.vlans.boxGraphic')} />
                    <BoxGraphic
                            portConfig={this.state.data.boxPortConfig}
                            colors={this.state.data.colors}
                            selectedVlan={this.state.data.selectedVlan}
                            portSelected={this.portSelected}
                            vlanStatus={this.state.data.vlanDisplay} />
                </div>

                <div className="viewBox viewFlex1">
                    {this.state.data.vlanDisplay.map(function(vlan) {
                        if (vlan.show) {
                            //var editToolbar = { edit: <GEditIcon /> };
                            //var displayState = DISPLAY_STATE;
                            //var colorElem =
                            //    this.state.data.colors[vlan.colorIndex];

                            //if (vlan.id === this.state.selectedPort) {
                            //    editToolbar = { edit: <EditElement
                            //                           color={colorElem.main} /> };
                           //     displayState = EDIT_STATE;
                            //}

                            return (
                                <div className="viewBox" key={vlan.id}>
                                    <ViewBoxHeader
                                        title={vlan.name} />
                                        { /*

                                        onClickIcon=
                                            {this.editVlan.bind(this,
                                                    vlan.id, vlan.editDisplayState, colorElem)}
                                        toolbar={{ edit: vlan.toolbar }} />
                                        <VlanKey
                                                color={colorElem.main}
                                                accent={colorElem.accent}
                                                data={vlan.data} />
                                        */ }
                                </div>
                            );
                        }
                    }, this)}
                </div>

                <div className="viewBox viewFlex1">
                    <ViewBoxHeader title="All VLANs" />
                    <AllVlansTable/>
                </div>

            </div>
        );
    }
});
