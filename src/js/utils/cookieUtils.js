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
