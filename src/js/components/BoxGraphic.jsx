/*
 (C) Copyright 2015 Hewlett Packard Enterprise Development LP

    Licensed under the Apache License, Version 2.0 (the "License"); you may
    not use this file except in compliance with the License. You may obtain
    a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
    License for the specific language governing permissions and limitations
    under the License.
*/

/*
 * Draws the Box Graphic
 */

var React = require('react'),
    PropTypes = React.PropTypes,
    Reflux = require('reflux'),
    I18n = require('i18n'),
    StatusText = require('StatusText'),
    BoxGraphicActions = require('BoxGraphicActions'),
    BoxGraphicStore = require('BoxGraphicStore');

// internationalization for this view
function t(key) {
    return I18n.text('components.boxGraphic.' + key);
}

/************* HELPER FUNCTIONS ******************/
function generatePortArray(type, data) {
    var portArray = [];
    var ports;

    //determine top or bottom port
    if ( type === 'Top' ) {
        ports = data.top;
    } else if ( type === 'Bottom' ) {
        ports = data.bottom;
    }

    // alternate ports top and bottom
    if ( data.style === 'alternate' ) {
        for (var i in ports) {
            if (ports.hasOwnProperty(i)) {
                var item = ports[i];

                // data represnted as a group: eg 1-5
                if (item.type === 'group') {
                    for (var j=item.start; j<=item.end; j+=2) {
                        portArray.push(j);
                    }

                //data as single port: eg. 10
                } else if (item.type === 'single') {
                    for (var k=0; k<item.num.length; k++) {
                        portArray.push(item.num[k]);
                    }
                }
            }
        }
    }

    return portArray;
}

// Color Badge component is used for the VLAN page
// This will display VLAN membership color badges
// if the port config vlan show status is set
var ColorBadge = React.createClass({

    displayName: 'ColorBadge',

    propTypes: {
        data: PropTypes.object,
        id: PropTypes.number,
        colors: PropTypes.array,
        vlanStatus: PropTypes.object
    },

    render: function() {
        var portData;
        var colors = this.props.colors;

        if (this.props.data && this.props.id in this.props.data) {
            portData = this.props.data[this.props.id];
        }

        // only load if the graphic is passed portData
        if (portData) {
            var status = this.props.vlanStatus;
            return (
                <table className="portBadgeContainer"><tr>
                    {portData.vlans.map(function(vlan, i) {
                        //Do not set the color style unless
                        //the color index is valid
                        if (colors[status[vlan].colorIndex]) {
                            var style = {
                                backgroundColor:
                                    colors[status[vlan].colorIndex].main
                            };

                            if (status[vlan].show === true) {
                                return (
                                    <td key={i}
                                        className="portBadge" style={style}></td>
                                );
                            }
                        }
                    }, this)}
                </tr></table>
            );
        }

        // otherwise return null
        return null;
    }
});

// Port status is used for the ports page to
// display the status of the shown ports
// Only if the port show variable is true
var PortStatus = React.createClass({

    displayName: 'PortStatus',

    propTypes: {
        port: PropTypes.number,
        data: PropTypes.object
    },

    render: function() {
        if (this.props.data[this.props.port]) {

            // determine state for the port:
            // amdin up + link up = up
            // otherwise display down for either/both admin and link
            var adminState = this.props.data[this.props.port].adminState;
            var linkState = this.props.data[this.props.port].linkState;
            var icon = [];
            var cls = [];
            var icons = [];

            // determine appropriate icons for display state
            // show up icon
            if (adminState === 'up' && linkState === 'up') {
                icon.push('check');

            // show both down icons
            } else if (linkState === 'down' && adminState === 'down') {
                icon.push('times');
                cls.push('admin');
                icon.push('times');
                cls.push('link');

            // show link down icon
            } else if (linkState === 'down') {
                icon.push('times');
                cls.push('link');

            // show admin down icon
            } else if (adminState === 'down') {
                icon.push('times');
                cls.push('admin');
            }

            // generate icons to display in the port
            for (var i=0; i<icon.length; i++) {
                var iconCls = cls[i] ? cls[i] : null;
                icons.push(
                    <i key={i} className={iconCls + ' fa fa-' + icon[i]}></i>
                );
            }

            return (
                <div className="portStatus icon">
                    {icons}
                </div>
            );

        }

        return ( null );
    }
});


// Component to generate the ports drawn on the box graphic
// Pass a port type - top or bottom to generate the
// correct type of port on the graphic - this takes into
// the port configuration for items drawn inside a port
var BoxPorts = React.createClass({

    displayName: 'BoxPorts',

    propTypes: {
        ports: PropTypes.object,
        type: PropTypes.string,
        portConfig: PropTypes.object,
        vlanStatus: PropTypes.object,
        portSelected: PropTypes.func,
        hwData: PropTypes.object
    },

    render: function() {
        var classType = 'boxPort' + this.props.type;
        var hwPort = null;
        var portsArray = generatePortArray(this.props.type,
            this.props.ports);

        return (
            <tr className={'boxPortBackground' + this.props.type}>
                {portsArray.map(function(num) {
                    if (this.props.hwData[num]) {
                        hwPort = this.props.hwData[num].portType;
                    }

                    var portSelectedCallBack = null;
                    if (this.props.portSelected) {
                        portSelectedCallBack =
                            this.props.portSelected.bind(null, num);
                    }

                    return (
                        <td key={num} id={'portBox' + num}
                            className="portBoxContainer"
                            onClick={portSelectedCallBack}>
                            <Port
                                num={num}
                                classType={classType}
                                hwPort={hwPort}
                                portConfig={this.props.portConfig}
                                vlanStatus={this.props.vlanStatus}
                            />
                        </td>
                    );
                }, this)}
           </tr>
        );
    }
});


// The Port component which acts as the port
// component inside the port table td. This div
// provides all of the styling for the port
// ports are styled by their hwPort type
var Port = React.createClass({

    displayName: 'Port',

    propTypes: {
        num: PropTypes.number,
        classType: PropTypes.string,
        hwPort: PropTypes.string,
        portConfig: PropTypes.object,
        vlanStatus: PropTypes.object
    },

    render: function() {
        var num = this.props.num;
        var classType = this.props.classType;
        var hwPort = this.props.hwPort;

        return (
                <div id={'portBoxInner' + num} className={classType + ' '
                    + hwPort}>
                    {this.props.portConfig.showVlans ?
                        <ColorBadge data={this.props.portConfig.data}
                            id={num}
                            colors={this.props.portConfig.colors}
                            vlanStatus={this.props.vlanStatus}/>
                    : null}

                    {this.props.portConfig.showPortStatus ?
                        <PortStatus data={this.props.portConfig.config}
                            port={num}/>
                    : null}
                </div>
        );
    }
});

// Component to draw the middle section of the box graphic
// Use middlePorts parameter from the config store
var BoxMiddle = React.createClass({

    displayName: 'BoxMiddle',

    propTypes: {
        ports: PropTypes.object,
        hwData: PropTypes.object
    },

    render: function() {

        var middleArray = [];
        var middle = this.props.ports.middle;

        // determine how to draw the middle ports based on
        // the middle component of the data config
        // the middle component can either list a number of
        // indexes to draw (numIndexes) or the actual
        // indexes to draw(indexes)
        if ('numIndexes' in middle) {
            for (var i=0; i<=middle.numIndexes; i++) {
                middleArray.push(i);
            }
        } else if ('indexes' in middle) {
            for (var j=0; j<middle.indexes.length; j++) {
                middleArray.push(middle.indexes[j]);
            }
        }

        // draw middle based on hwPort type
        return (
            <tr className='boxPortBackgroundMiddle'>
                {middleArray.map(function(index) {
                    if (this.props.hwData[index]) {
                        var hwPort = this.props.hwData[index].portType;
                        if (hwPort === 'SFP_PLUS' || hwPort === 'RJ45') {
                            return (
                                <MiddleSfpPlus key={index} index={index}/>
                            );
                        } else if (hwPort === 'QSFP_PLUS') {
                            return (
                                <MiddleQSfpPlus key={index} index={index}/>
                            );
                        }
                    }
                }, this)}
            </tr>
        );
    }
});


// MiddleSfpPlus component draws the middle component
// for an SFP_PLUS port
var MiddleSfpPlus = React.createClass({

    displayName: 'MiddleSfpPlus',

    propTypes: {
        index: PropTypes.number
    },

    render: function() {
        return (
            <td key={this.props.index}>
                <div className="boxMiddle SFP_PLUS">
                    <div className="boxBlack boxBlackTop"></div>
                    <div className="arrowBlack boxArrowUp"></div>
                    <div className="arrowBlack boxArrowDown"></div>
                    <div className="boxBlack boxBlackBottom"></div>
                </div>
            </td>
        );
    }
});

// MiddleQSfpPlus component draws the middle component
// for an QSFP_PLUS port
var MiddleQSfpPlus = React.createClass({

    displayName: 'MiddleQSfpPlus',

    propTypes: {
        index: PropTypes.number
    },

    render: function() {
        return (
            <td key={this.props.index}>
                <div className="boxMiddle QSFP_PLUS">
                    <div className="arrowBlack boxArrowUp"></div>
                    <div className="circleBlack left"></div>
                    <div className="circleBlack right"></div>
                    <div className="arrowBlack boxArrowDown"></div>
                </div>
            </td>
       );
    }
});


// Component to draw the port labels on the graphic
// Based off of the ports list from the store
var BoxPortLabels = React.createClass({

    displayName: 'BoxPortLabels',

    propTypes: {
        ports: PropTypes.object,
        hwData: PropTypes.object
    },

    render: function() {

        //generate port list for both top and bottom ports
        var portNumsTop = generatePortArray('Top', this.props.ports);
        var portNumsBottom = generatePortArray('Bottom', this.props.ports);
        var tableRows = [];

        // for as5712 we know that there are as many bottom ports as top ports
        // so the numbers can be based off the list of tops ports
        for (var i=0; i<portNumsTop.length; i++) {
            var hwPort = null;
            if (this.props.hwData[portNumsTop[i]]) {
                hwPort = this.props.hwData[portNumsTop[i]].portType;
            }

            // push the port labels to the tableRows
            tableRows.push(
                <td key={i}>
                    <div className={'boxLabels ' + hwPort}>
                        <div className="boxNumLabels boxTopLabels">
                            {portNumsTop[i]}
                        </div>
                        <div className="arrowWhite boxArrowUpLabel"></div>
                        <div className="arrowWhite boxArrowDownLabel"></div>
                        <div className="boxNumLabels boxBottomLabels">
                            {portNumsBottom[i]}
                        </div>
                    </div>
                </td>
            );
        }

        return (
            <tr>
                {tableRows}
            </tr>
        );
    }
});

// BoxPortExtras draws the extra ports from the data
// config specification
var BoxPortExtras = React.createClass({

    displayName: 'BoxPortExtras',

    propTypes: {
        ports: PropTypes.object,
        hwData: PropTypes.object,
        vlanStatus: PropTypes.object,
        portConfig: PropTypes.object,
        portSelected: PropTypes.func
    },

    render: function() {
        var extras = [];
        var data = this.props.ports;
        var classType = 'boxPortTop';

        // loop through the data indexes to draw the
        // extra ports
        for (var i=0; i<data.indexes; i++) {

            // if there is no list of ports - draw an empty
            // td to keep the correct index alignment
            if (!data.ports) {
                extras.push(<td key={i}></td>);
            } else {

                //draw the ports
                var idx = data.ports[i];

                //get the hwPort type
                if (this.props.hwData[idx]) {
                    var hwPort = this.props.hwData[idx].portType;

                    // get the onClick callback if present
                    var portSelectedCallBack = null;
                    if (this.props.portSelected) {
                        portSelectedCallBack =
                            this.props.portSelected.bind(null, idx);
                    }

                    //push the port onto the extras list
                    extras.push(
                        <td key={idx} id={'portBox' + idx}
                            className="portBoxContainer"
                            onClick={portSelectedCallBack}>
                            <Port
                                num={idx}
                                classType={classType}
                                hwPort={hwPort}
                                portConfig={this.props.portConfig}
                                vlanStatus={this.props.vlanStatus}
                            />
                            <div className="portExtraNum">{idx}</div>
                        </td>
                    );
                }
            }
        }

        return (
            <tr>
                {extras}
            </tr>
        );
    }
});

var BoxGraphicLayout = React.createClass({

    displayName: 'BoxGraphicLayout',

    propTypes: {
        portConfig: PropTypes.object,
        colors: PropTypes.array,
        vlanStatus: PropTypes.object,
        selectedVlan: PropTypes.number,
        portSelected: PropTypes.func,
        loadCompleted: PropTypes.number,
        base: PropTypes.object,
        hwData: PropTypes.object
    },

    render: function() {
        var key = 0;
        return (
            <div className="boxContainer">
                {this.props.loadCompleted ?
                <table className="innerBoxTable">
                    <tr>
                        {this.props.base.map(function(group) {
                            return (
                                <td key={key++} className="portsWrapper">
                                    <table>
                                        <BoxPorts type={"Top"}
                                            ports={group}
                                            portConfig={this.props.portConfig}
                                            portSelected={this.props.portSelected}
                                            vlanStatus={this.props.vlanStatus}
                                            hwData={this.props.hwData}/>
                                        <BoxMiddle ports={group}
                                            hwData={this.props.hwData}/>
                                        <BoxPorts type={"Bottom"}
                                            ports={group}
                                            portConfig={this.props.portConfig}
                                            portSelected={this.props.portSelected}
                                            vlanStatus={this.props.vlanStatus}
                                            hwData={this.props.hwData}/>
                                        <BoxPortLabels ports={group}
                                            hwData={this.props.hwData}/>
                                        <BoxPortExtras ports={group.extra}
                                            hwData={this.props.hwData}
                                            portConfig={this.props.portConfig}
                                            portSelected={this.props.portSelected}
                                            vlanStatus={this.props.vlanStatus}/>
                                    </table>
                                </td>
                            );
                        }, this)}
                    </tr>
                </table>
                : null}
            </div>
        );
    }
});

//Main box graphic component
module.exports = React.createClass({

    displayName: 'BoxGraphic',

    propTypes: {
        portConfig: PropTypes.object,
        colors: PropTypes.array,
        vlanStatus: PropTypes.object,
        selectedVlan: PropTypes.number,
        portSelected: PropTypes.func
    },

    mixins: [ Reflux.connect(BoxGraphicStore, 'ports') ],

    componentDidMount: function() {
        // load the box graphic configuration data
        BoxGraphicActions.loadBoxGraphic();
    },

    // component contains row of top ports,
    // row to represent middle graphic,
    // row of bottom ports and a row of port nums
    render: function() {
        return (
            <div>
                {this.state.ports.showGraphic ?
                    <BoxGraphicLayout
                        portConfig={this.props.portConfig}
                        portSelected={this.props.portSelected}
                        vlanStatus={this.props.vlanStatus}
                        hwData={this.state.ports.hwData}
                        base={this.state.ports.data.base}
                        loadCompleted={this.state.ports.loadCompleted}
                    />
                    : <StatusText value='disabled' text={t('noPorts')} />
                }
            </div>
        );
    }
});
