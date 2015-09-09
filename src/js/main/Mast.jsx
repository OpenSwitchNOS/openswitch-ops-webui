/*
 * Mast component that contains the logo, user, etc.
 * @author Kelsey Dedoshka
 * @author Frank Wood
 * @author Al Harrington
 */

var React = require('react'),
    I18n = require('i18n'),
    Reflux = require('reflux'),
    RenderActions = require('RenderActions'),
    RenderStore = require('RenderStore'),
    SystemInfoActions = require('SystemInfoActions'),
    UserStore = require('UserStore'),
    ActionIcon = require('ActionIcon');

module.exports = React.createClass({

    displayName: 'Mast',

    mixins: [
        Reflux.connect(RenderStore, 'render'),
        Reflux.connect(UserStore, 'user'),
        // FIXME: create a MastStore I think.
        Reflux.listenTo(SystemInfoActions.load.completed, 'onSysInfoLoaded')
    ],

    componentDidMount: function() {
        // FIXME: create a MastStore I think.
        SystemInfoActions.load();

    },

    onSysInfoLoaded: function(data) {
        this.setState({
            sysInfo: data
        });
    },

    render: function() {
        // FIXME: bogus data, clean up this.state below
        var t = I18n.text,
            partNum = this.state.sysInfo && this.state.sysInfo.partNum,
            serialNum = this.state.sysInfo && this.state.sysInfo.serialNum,
            hostName = this.state.sysInfo && this.state.sysInfo.hostName,
            user = 'John Powell',
            showToggleIcon = this.state.render.showNavPane,
            chevron = showToggleIcon ? 'chevron-left' : 'chevron-right',
            toggleIcon = (
                <ActionIcon
                    className='fa-lg'
                    fa={chevron}
                    onClick={RenderActions.toggleNavPane}
                />
            );

        return (
            <div id="mast">

                <span>
                    {toggleIcon}
                    <img src="OpenSwitchLogo.png" />
                </span>

                <span id='mastDeviceInfo'>
                    <b>{t('hostName')}:</b>&nbsp;{hostName || ''}
                    &nbsp;-&nbsp;
                    <b>{t('partNum')}:</b>&nbsp;{partNum || ''}
                    &nbsp;-&nbsp;
                    <b>{t('serialNum')}:</b>&nbsp;{serialNum || ''}
                </span>

                <span id='mastUserInfo'>
                    <b>{t('user')}:</b>&nbsp;{user}
                </span>

            </div>
        );
    }

});
