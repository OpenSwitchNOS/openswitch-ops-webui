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
 * Calculations shared module for view calcs
 *
 */

// calculates utilization based off parameters
function calcUtil(prevBytes, currBytes, speed, intervalMs) {
    var maxBytesPerSec, bytesPerSec, utilization;

    if (isNaN(prevBytes) || isNaN(currBytes) || isNaN(speed) ||
        isNaN(intervalMs) || speed <= 0 || currBytes < prevBytes ||
        intervalMs <= 0) {

        return 0;
    }

    maxBytesPerSec = speed / 8;
    bytesPerSec = (currBytes - prevBytes) / (intervalMs / 1000);
    utilization = 100 * (bytesPerSec / maxBytesPerSec);

    return (utilization > 100) ? 100 : utilization;
}

module.exports = {
    calcUtil: calcUtil
};
