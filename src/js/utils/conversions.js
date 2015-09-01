/*
 * Conversions shared functions
 * @uthor Kelsey Dedoshka
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
