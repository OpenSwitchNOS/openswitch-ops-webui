/*
 * Internationalization utility.
 * @author Frank Wood
 */

// Get the locale setting from the 'package.json'.
var packageJson = require('package'),
    locale = packageJson.i18n,
    ObjectPath = require('object-path');

// Set the default language based on the locale.
var language = require('../i18n/' + locale + '.js');

function unkKey(key) { return '~' + key + '~'; }

module.exports = {

    // Returns the locale for the current language set.
    locale: language.locale,

    // Returns the localized string for the given key (or path).
    // If 'useLanguage' is specified, it will be used instead of the current
    // locale language.
    text: function(key, useLanguage) {
        if (useLanguage) {
            return ObjectPath.get(useLanguage.messages, key, unkKey(key));
        }
        return ObjectPath.get(language.messages, key, unkKey(key));
    }

};
