/*
 * Cookie utilities.
 */

function getCookie(key) {
    var searchName = key + '=',
        ca = document.cookie.split(';'),
        c, i;

    for (i=0; i<ca.length; i++) {
        c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(searchName) === 0) {
            return c.substring(searchName.length, c.length);
        }
    }
    return '';
}

function deleteCookie(key) {
    document.cookie = key + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

module.exports = {

    get: getCookie,

    delete: deleteCookie

};
