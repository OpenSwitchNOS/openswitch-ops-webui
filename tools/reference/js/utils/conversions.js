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
 * Conversions shared functions
 *
 */

// convert bps to gbps
function bpsToGbps(bps) {
    var CONVERSION_RATE = 1000000000;

    if (bps <= 0) { return 0; }
    return (Number(bps)/CONVERSION_RATE);
}

// convert B to MB
function bytesToMbytes(bytes) {
    var CONVERSION_RATE = 1000000;
    return (Number(bytes)/CONVERSION_RATE);
}

// Round to 1 decimal place
function round1D(num) {
    return Math.round( num * 10 ) / 10;
}

module.exports = {
    bpsToGbps: bpsToGbps,
    bytesToMbytes: bytesToMbytes,
    round1D: round1D
};
