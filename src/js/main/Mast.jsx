/*
 * Mast component that contains the logo, user, etc.
 * @author Kelsey Dedoshka
 * @author Frank Wood
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
        Reflux.connect(UserStore, 'user')
    ],

    componentDidMount: function() {
        // FIXME: create a MastStore I think.
        SystemInfoActions.load();
    },

    render: function() {
        // FIXME: bogus data
        var t = I18n.text,
            prod = 'Part#', //this.state.sys.product,
            sysName = 'Serial#', //this.state.sys.name,
            sysLoc = 'alswitch3.rose.hp.com', //this.state.sys.location,
            user = 'Carl Spangler',
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

                <span>
                    <b>{prod}&nbsp;-</b>&nbsp;{sysName}&nbsp;-&nbsp;{sysLoc}
                </span>

                <span>
                    <b>{t('user')}:</b>&nbsp;{user}
                </span>

            </div>
        );
    }

});
