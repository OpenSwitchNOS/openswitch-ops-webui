/*
 * Actions for switching the render configuration.
 * @author Frank Wood
 */

var Reflux = require('reflux');

// TODO: change the name of this to "global settings" or something.

module.exports = Reflux.createActions([
    'smallScreen',
    'normalScreen',
    'showNavPane',
    'hideNavPane',
    'toggleNavPane',
    'login',
    'postRequestErr',
    'clearRequestErr',
    'restApiRedirect'
]);
