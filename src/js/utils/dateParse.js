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
 * Enacpsulating parsing a date into human readable format
 *
 */

var I18n = require('i18n');

// detect if to LocaleTimeString is a supported
// function in the browser
function toLocaleTimeStringSupported() {
    //if (new Date().toLocaleTimeString
    try {
        new Date().toLocaleTimeString(I18n.locale);
    } catch (e) {
        return e.name === 'RangeError';
    }

    return true;
}


// convert the timestamp ticks into local time format
// if locale conversion is supported. Otherwise convert
// it in relative format
function convert(date) {

    if (!date) {
        return '';
    }

    if (toLocaleTimeStringSupported()) {
        return new Date(date).toLocaleTimeString(I18n.locale, {
            hour12: false
        });
    }

    return new Date(date).toTimeString().split(' ')[0];
}

module.exports = {
    convert: convert
};
