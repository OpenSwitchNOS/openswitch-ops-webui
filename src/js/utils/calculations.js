/*
 * Calculations shared module for view calcs
 * @uthor Kelsey Dedoshka, Frank Wood
 *
 */

// calculates utilization based off parameters
function calcUtil(prevBytes, currBytes, speed, intervalMs) {

    var maxBytesPerSec, bytesPerSec, utilization;
    if (speed <= 0 || currBytes < prevBytes || intervalMs <= 0) {
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
