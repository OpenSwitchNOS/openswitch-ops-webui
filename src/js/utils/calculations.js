/*
 * Calculations shared module for view calcs
 * @uthor Kelsey Dedoshka, Frank Wood
 *
 */

function calcFullUtil(prev, curr, linkSpeed) {
    //parameters should be passed as numbers but
    //Number conversion done here for precausion
    var currData = Number(curr);
    var prevData = Number(prev);
    var linkSpeedData = Number(linkSpeed);

    //FIXME - the curr or prev could be 0 when passed it - invalid checked case
    if (!currData || !prevData || !linkSpeedData) { return 0; }

    var util = (((currData - prevData) / linkSpeedData) * 100);
    if (util > 100) { util = 100; }
    if (util < 0) { util = 0; }

    return util;
}

module.exports = {
    calcFullUtil: calcFullUtil
};
