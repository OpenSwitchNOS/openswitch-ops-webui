/*
 * Main entry point for loading modules.
 * @author Kelsey Dedoshka
 * @author Frank Wood
 */

// Include the main style sheet.
require('../scss/index.scss');

// Include support for FontAwesome icons.
// TODO: investigation if all font-awesome files are needed?
require('font-awesome-webpack');

// Bootstrap the router (runs our application).
require('router');
