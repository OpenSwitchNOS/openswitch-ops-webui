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
 * Internationalization utility.
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
