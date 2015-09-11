/*
 * Enacpsulating parsing a date into human readable format
 * @uthor Kelsey Dedoshka, Frank Wood
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
