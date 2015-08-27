/*
 * Manipulating a date stamp
 * @uthor Kelsey Dedoshka
 *
 */

function hrsSecs(date) {

    if (!date) {
        return '';
    }

    var elems = date.split(' '),
        time = elems[4].split(':'),
        identifier,
        hr = time[0],
        min = time[1],
        sec = time[2];

    identifier = hr >= 12 ? 'PM' : 'AM';
    hr = hr > 12 ? hr - 12 : hr;

    return hr + ':' + min + ':' + sec + ' ' + identifier;
}

module.exports = {
    hrsSecs: hrsSecs
};
