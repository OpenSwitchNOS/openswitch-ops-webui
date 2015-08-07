/*
 * Actions for switching the render configuration.
 * @author Frank Wood
 */

var Reflux = require('reflux');

module.exports = Reflux.createActions([
    'smallScreen',
    'normalScreen',
    'showNavPane',
    'hideNavPane',
    'toggleNavPane'
]);
