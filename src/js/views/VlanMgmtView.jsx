/*
 * VLAN management view.
 * @author Kelsey Dedoshka
 */

var React = require('react'),
    PropTypes = React.PropTypes,
    Reflux = require('reflux'),
    I18n = require('i18n'),
    ViewBoxHeader = require('ViewBoxHeader'),
    GTable = require('grommet/components/Table'),
    CheckBox = require('CheckBox'),
    BoxGraphic = require('BoxGraphic'),
    StatusText = require('StatusText'),
    GLayer = require('grommet/components/Layer'),
    GButton = require('grommet/components/Button'),
    GFooter = require('grommet/components/Footer'),
    Port = require('Port'),
    ColorBlock = require('ColorBlock'),
    VlanMgmtActions = require('VlanMgmtActions'),
    VlanMgmtStore = require('VlanMgmtStore'),
    MAX_VLANS_TO_DISPLAY = 4;

/*********** Helper functions **************/

// format the port array to be human readable
function formatPorts(portArray) {
    var list = portArray.sort(function(a, b) { return a-b; }).join(', ');
    return list;
}

// i18n helper function for this view
function t(key) {
    return I18n.text('views.vlanMgmt.' + key);
}

// Component to list all vlans in the VLAN
// table displayed below the box graphic
var AllVlansTable = React.createClass({

    displayName: 'AllVlansTable',

    propTypes: {
        data: PropTypes.object,
        selectedVlans: PropTypes.number,
        vlanStatus: PropTypes.object
    },

    // handler when a VLAN display checkbox is selected
    // toggle the display based on the state of the checkbox
    toggleVlanDisplay: function(e) {
        VlanMgmtActions.toggleVlanDisplay(e.target.id, e.target.checked);
    },

    render: function() {
        // iterate through the vlans object and generate the table
        // rows to be displayed with vlan data
        var tableRows = [];

        for (var key in this.props.data) {

            if (this.props.data.hasOwnProperty(key)) {
                var vlan = this.props.data[key];
                var ports = { 'native-tagged': [],
                    'native-untagged': [],
                    'access': [],
                    'trunk': []
                };
                var status = false;

                // generate ports list by vlan mode for VLAN table rows
                for (var i in vlan.ports) {
                    if (vlan.ports.hasOwnProperty(i)) {
                        var port = vlan.ports[i];
                        if (port.vlan_mode in ports) {
                            ports[port.vlan_mode].push(port.name);
                        }
                    }
                }

                // disable remaining check boxes if max vlans
                // displayed in graphic
                if (this.props.selectedVlans === MAX_VLANS_TO_DISPLAY &&
                    !this.props.vlanStatus[vlan.data.id].show) {
                    status = true;
                }

                //push the table row to be rendered below
                tableRows.push(
                    <tr key={vlan.data.id}>
                        <td>{vlan.data.name}</td>
                        <td>{vlan.data.id}</td>
                        <td>{vlan.data.oper_state}</td>
                        <td>{formatPorts(ports['native-untagged'])}</td>
                        <td>{formatPorts(ports['native-tagged'])}</td>
                        <td>{formatPorts(ports.access)}</td>
                        <td>{formatPorts(ports.trunk)}</td>
                        <td>
                            <CheckBox id={vlan.data.id}
                                onChange={this.toggleVlanDisplay}
                                disabled={status}/>
                        </td>
                    </tr>
                );
            }
        }

        return (
            <GTable className="defaultTable allVlanTable">
                <thead>
                    <th>{t('th.name')}</th>
                    <th>{t('th.id')}</th>
                    <th>{t('th.status')}</th>
                    <th>{t('th.untagged')}</th>
                    <th>{t('th.tagged')}</th>
                    <th>{t('th.access')}</th>
                    <th>{t('th.trunk')}</th>
                    <th>{t('th.display')}</th>
                </thead>
                <tbody>
                    {tableRows}
                </tbody>
            </GTable>
        );
    }
});


// component for a vlan key component including
// the colorblock and the port image
var VlanKey = React.createClass({

    displayName: 'VlanKey',

    propTypes: {
        accent: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired
    },

    render: function() {
        return (
            <div className="vlanKeyContainerSmall">
                <div className="colorBlockKeyContainer">
                    <ColorBlock accent={this.props.accent}
                        main={this.props.color}
                        size={"Small"}/>
                </div>
                <div className="portKeyContainer">
                    <Port size={"Small"}/>
                </div>
            </div>
        );
    }
});

// component to generate the entire vlan key
// include the vlan name and toolbar icon
var VlanKeyItem = React.createClass({

    displayName: 'VlanKeyItem',

    propTypes: {
        colorElem: PropTypes.object,
        vlanData: PropTypes.object,
        edit: PropTypes.number
    },

    render: function() {
        return (
            <div className="vlanKeyItemWrapper">
                <div className="vlanKey">
                    <VlanKey color={this.props.colorElem.main}
                        accent={this.props.colorElem.accent}/>
                </div>
                <div className="vlanName">{this.props.vlanData.data.name}</div>
            </div>
        );
    }
});


// Component to display the membership table in the
// port details panel. The Membership table shows
// which VLANs a port is a member of
var MembershipTable = React.createClass({

    displayName: 'MembershipTable',

    propTypes: {
        data: PropTypes.object,
        port: PropTypes.object
    },

    // get the index of the port in the ports
    // array. return index or -1 if not found
    getPortIndex: function(ports, port) {
        for (var i=0; i<ports.length; i++ ) {
            if (Number(ports[i].name) === port) {
                return i;
            }
        }

        return -1;
    },

    render: function() {
        var tableRows = [];
        var displayTable = true;

        // generate the table rows for the membership table
        for (var key in this.props.data.vlans) {
            if (this.props.data.vlans.hasOwnProperty(key)) {

                var vlan = this.props.data.vlans[key];
                if (vlan) {

                    //get the port index to list appropriate vlan mode
                    var index = this.getPortIndex(vlan.ports, this.props.port);
                    if (index !== -1) {
                        tableRows.push(
                            <tr>
                                <td>{vlan.data.name}</td>
                                <td>{vlan.ports[index].vlan_mode}</td>
                            </tr>
                        );
                    }
                }
            }
        }

        // do not show an empty table if the selected VLAN
        // is not a member of any VLANs - show no Ports
        // message instead
        if (tableRows.length === 0) { displayTable = false; }

        return (
            <div>
            {displayTable ?
                <GTable className="defaultTable">
                    <thead>
                        <th>{t('th.vlan')}</th>
                        <th>{t('th.portType')}</th>
                    </thead>
                    <tbody>
                        {tableRows}
                    </tbody>
                </GTable>
            : t('noVlans')}
            </div>
        );
    }
});


// Component to display the port details in the
// right slide panel - this component acts as the
// details panel wrapper
var PortDetails = React.createClass({

    displayName: 'PortDetails',

    propTypes: {
        port: PropTypes.string,
        data: PropTypes.object
    },

    // handler for closing the details layer
    // panel
    closeLayerPanel: function() {
        VlanMgmtActions.closePortDetails();
    },

    render: function() {
        return (
            <GLayer className="portEditLayer"
                align={"right"}
                closer={true}
                onClose={this.closeLayerPanel}>

                <div className="heading">{'Port ' + this.props.port}</div>
                <div className="subheader">VLAN Membership</div>
                <MembershipTable data={this.props.data} port={this.props.port}/>

                <hr className="divider"/>
                <GFooter className="portEditFooter">
                    <GButton primary={true} label="Done" onClick={this.closeLayerPanel}/>
                </GFooter>
            </GLayer>
        );
    }
});


// Main View Component
module.exports = React.createClass({

    displayName: 'VlanMgmtView',

    mixins: [ Reflux.connect(VlanMgmtStore, 'data') ],

    componentDidMount: function() {
        //load the vlans on component mount
        VlanMgmtActions.loadVlans();
    },

    componentWillUnmount: function() {
        //reset global flags when the component unmounts
        VlanMgmtActions.resetStore();
    },

    //handler when a port is selected in the box graphic
    portSelected: function(num) {
        VlanMgmtActions.showPortDetails(num);
    },

    render: function() {
        var keyToolbar = {};

        // generate the VLAN keys based on what VLANs
        // are selected to display
        for (var key in this.state.data.vlanDisplay) {
            if (this.state.data.vlanDisplay.hasOwnProperty(key)) {
                var vlan = this.state.data.vlanDisplay[key];
                if (vlan.show) {
                    var colorElem = this.state.data.colors[vlan.colorIndex];
                    var vlanId = vlan.data.id;

                    // keyToolbar contains VLAN key items that appear
                    // in the box graphic toolbar. Add a key item if the
                    // the show state of the vlan is true
                    keyToolbar[vlanId] = (<VlanKeyItem colorElem={colorElem}
                        vlanData={vlan}/>);
                }
            }

        }

        return (
            <div>
                <div id="vlanMgmtView" className="viewFill viewCol">
                    <div className="viewBox viewFlex0">
                        <ViewBoxHeader title={t('boxGraphic')}
                            toolbar={keyToolbar}/>
                        <BoxGraphic
                            portConfig={this.state.data.boxPortConfig}
                            portSelected={this.portSelected}
                            vlanStatus={this.state.data.vlanDisplay} />
                    </div>
                    <div className="viewBox viewFlex0">
                        <ViewBoxHeader title={t('allVlans')}/>
                        {Object.keys(this.state.data.vlans).length !== 0 ?
                            <AllVlansTable
                                data={this.state.data.vlans}
                                selectedVlans={this.state.data.numberOfSelectedVlans}
                                vlanStatus={this.state.data.vlanDisplay}/>
                        : <StatusText value='warning'
                            text={t('noConfiguredVlans')}/>
                        }
                    </div>
                </div>
                {this.state.data.portDetails.show ?
                    <PortDetails
                        port={this.state.data.portDetails.port}
                        data={this.state.data}/>
                : null}
            </div>
        );
    }
});
