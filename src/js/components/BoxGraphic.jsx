/*
 * Tile panel that contains header text, content and an optional edit button.
 * @author Kelsey Dedoshka
 */

var React = require('react'),
    PropTypes = React.PropTypes,
    Reflux = require('reflux'),
    BoxGraphicActions = require('BoxGraphicActions'),
    BoxGraphicStore = require('BoxGraphicStore');

var ColorBadge = React.createClass({

    displayName: 'ColorBadge',

    propTypes: {
        data: PropTypes.object,
        id: PropTypes.number,
        colors: PropTypes.array,
        vlanStatus: PropTypes.array
    },

    render: function() {
        var portData;
        if (this.props.data) {
            portData = this.props.data[this.props.id];
        }

        var colors = this.props.colors;
        if (portData) {
            var status = this.props.vlanStatus;
            return (
                <table className="portBadgeContainer"><tr>
                    {portData.vlans.map(function(vlan) {
                        var style = {
                            backgroundColor:
                                colors[status[vlan].colorIndex].main
                        };
                        if (status[vlan].show === true) {
                            return (
                                <td key={vlan.id}
                                className="portBadge" style={style}></td>
                            );
                        }
                    }, this)}
                </tr></table>
            );
        }

        return (
            <div></div>
        );
    }
});

var BoxPorts = React.createClass({

    displayName: 'BoxPorts',

    propTypes: {
        type: PropTypes.string,
        portConfig: PropTypes.object,
        colors: PropTypes.array,
        vlanStatus: PropTypes.array,
        portSelected: PropTypes.func
    },

    mixins: [ Reflux.connect(BoxGraphicStore, 'ports')],

    render: function() {
        var classType = 'boxPort' + this.props.type;
        var portsArray = [];
        var start, end;

        if ( this.props.type === 'Top' ) {
            start = this.state.ports.data.startTop;
            end = this.state.ports.data.endTop;
        } else if ( this.props.type === 'Bottom' ) {
            start = this.state.ports.data.startBottom;
            end = this.state.ports.data.endBottom;
        }

        if ( this.state.ports.data.style === 'alternate' ) {
            for ( var i=start; i<=end; i+=2 ) {
                portsArray.push(i);
            }
        }

        return (
            <tr className={'boxPortBackground' + this.props.type}>
                {portsArray.map(function(num) {

                    var portSelectedCallBack = null;
                    if (this.props.portSelected) {
                        portSelectedCallBack = this.props.portSelected.bind(null, num);
                    }

                    return (
                        <td key={num} id={'portBox' + num}
                            className="portBoxContainer"
                            onClick={portSelectedCallBack}>
                            <div id={'portBoxInner' + num} className={classType}>
                               <ColorBadge data={this.props.portConfig}
                                            id={num}
                                            colors={this.props.colors}
                                            vlanStatus={this.props.vlanStatus}/>
                            </div>
                        </td>
                    );
                }, this)}
           </tr>
        );
    }
});

var BoxMiddle = React.createClass({

    displayName: 'BoxMiddle',

    mixins: [ Reflux.connect(BoxGraphicStore, 'ports') ],

    render: function() {
        var middleArray = [];
        for (var i=this.state.ports.data.startTop; i<=this.state.ports.data.endTop; i+=2) {
            middleArray.push(i);
        }

        return (
            <tr className='boxPortBackgroundMiddle'>
                {middleArray.map(function(index) {
                    return (
                        <td key={index}>
                            <div className="boxMiddle">
                                <div className="boxBlack boxBlackTop"></div>
                                <div className="arrowBlack boxArrowUp"></div>
                                <div className="arrowBlack boxArrowDown"></div>
                                <div className="boxBlack boxBlackBottom"></div>
                            </div>
                        </td>
                    );
                }, this)}
            </tr>
        );
    }
});

var BoxPortLabels = React.createClass({

    displayName: 'BoxPortLabels',

    mixins: [ Reflux.connect(BoxGraphicStore, 'ports') ],

    render: function() {
        var portNums = [];
        if ( this.state.ports.data.style === 'alternate' ) {
            for (var i=this.state.ports.data.startTop; i<=this.state.ports.data.endTop; i+=2) {
                portNums.push(i);
            }
        }

        return (
            <tr>
                {portNums.map(function(num) {
                    return (
                        <td key={num}>
                            <div className="boxLabels">
                                <div className="boxNumLabels boxTopLabels">{num}</div>
                                <div className="arrowWhite boxArrowUpLabel"></div>
                                <div className="arrowWhite boxArrowDownLabel"></div>
                                <div className="boxNumLabels boxBottomLabels">{num+1}</div>
                            </div>
                        </td>
                    );
                }, this)}
            </tr>
        );
    }
});


module.exports = React.createClass({

    displayName: 'BoxGraphic',

    propTypes: {
        portConfig: PropTypes.object,
        colors: PropTypes.array,
        vlanStatus: PropTypes.array,
        selectedVlan: PropTypes.number,
        portSelected: PropTypes.func
    },

    componentDidMount: function() {
        BoxGraphicActions.loadBoxGraphic();
    },

    render: function() {
        return (
            <div className="boxContainer">
                <table className="innerBoxTable">
                    <BoxPorts type={"Top"}
                        portConfig={this.props.portConfig}
                        colors={this.props.colors}
                        selectedVlan={this.props.selectedVlan}
                        portSelected={this.props.portSelected}
                        vlanStatus={this.props.vlanStatus}/>
                    <BoxMiddle/>
                    <BoxPorts type={"Bottom"}
                        portConfig={this.props.portConfig}
                        colors={this.props.colors}
                        selectedVlan={this.props.selectedVlan}
                        portSelected={this.props.portSelected}
                        vlanStatus={this.props.vlanStatus}/>
                    <BoxPortLabels/>
                </table>
            </div>
        );
    }

});
