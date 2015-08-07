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
    SystemInfoStore = require('SystemInfoStore'),
    SystemInfoActions = require('SystemInfoActions'),
    UserStore = require('UserStore'),
    ClassNames = require('classnames');

module.exports = React.createClass({

    displayName: 'Mast',

    mixins: [
        Reflux.connect(RenderStore, 'render'),
        Reflux.connect(SystemInfoStore, 'sys'),
        Reflux.connect(UserStore, 'user')
    ],

    componentDidMount: function() {
        SystemInfoActions.load();
    },

    render: function() {
        // FIXME: bogus data
        var t = I18n.text,
            prod = 'Part#', //this.state.sys.product,
            sysName = 'Serial#', //this.state.sys.name,
            sysLoc = 'alswitch3.rose.hp.com', //this.state.sys.location,
            user = this.state.user.name,
            showNavPane = this.state.render.showNavPane,
            navToggleCls = ClassNames(
                'faClickable', 'fa', 'fa-lg',
                { 'fa-chevron-left': showNavPane },
                { 'fa-chevron-right': !showNavPane }
            );

        return (
            <div id="mast">

                <span>
                    <i className={navToggleCls}
                        onClick={RenderActions.toggleNavPane} />
                    <img id="mastLogo" src="OpenHalonLogo.png" />
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
