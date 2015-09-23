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
 * Mast component that contains the logo, user, etc.
 */

var React = require('react'),
    I18n = require('i18n'),
    Reflux = require('reflux'),
    RenderActions = require('RenderActions'),
    RenderStore = require('RenderStore'),
    SystemInfoActions = require('SystemInfoActions'),
    SessionStore = require('SessionStore'),
    ActionIcon = require('ActionIcon'),
    GMenu = require('grommet/components/Menu'),
    GEditIcon = require('grommet/components/icons/Edit'),
    Router = require('react-router'),
    Link = Router.Link;

function t(key) {
    return I18n.text(key);
}

module.exports = React.createClass({

    displayName: 'Mast',

    // FIXME: create a MastStore I think.
    mixins: [
        Reflux.connect(RenderStore),
        Reflux.listenTo(SessionStore, 'onSessionChanged'),
        Reflux.connect(SessionStore),
        Reflux.listenTo(SystemInfoActions.load.completed, 'onSysInfoLoaded')
    ],

    componentDidMount: function() {
        if (SessionStore.userId()) {
            SystemInfoActions.load();
        }
    },

    onSessionChanged: function(data) {
        if (data.userId) {
            SystemInfoActions.load();
        }
        this.setState(data);
    },

    onSysInfoLoaded: function(data) {
        this.setState({
            sysInfo: data
        });
    },

    render: function() {
        // FIXME: bogus data, clean up this.state below
        var partNum = this.state.sysInfo && this.state.sysInfo.partNum,
            serialNum = this.state.sysInfo && this.state.sysInfo.serialNum,
            hostName = this.state.sysInfo && this.state.sysInfo.hostName,
            user = this.state.userId,
            showToggleIcon = this.state.showNavPane,
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
                    { user ?
                        <span>
                            <b>{t('user')}:</b>&nbsp;
                            {user}&nbsp;&nbsp;&nbsp;
                        </span>
                        : null }
                    <GMenu icon={<GEditIcon />}>
                        <Link to={'/login'}>{t('logout')}</Link>
                    </GMenu>
                </span>

            </div>
        );
    }

});
