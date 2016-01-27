/*
 * Calculations tests
 * @author Kelsey Dedoshka
 */

describe('Test suite for conversions', function() {
        var cnvs,
            bpsToGbps = {
                t1: {
                    bps: 10000000000,
                    result: 10
                },
                t2: {
                    bps: 1000000000,
                    result: 1
                },
                t3: {
                    bps: 2309654444,
                    result: 2.309654444
                },
                t4: {
                    bps: -12365437,
                    result: 0
                },
                t5: {
                    bps: 0,
                    result: 0
                }
            },
            bytesToMb = {
                t1: {
                    b: 1000000,
                    result: 1
                },
                t2: {
                    b: 2700400,
                    result: 2.7004
                },
                t3: {
                    b: -2000000,
                    result: -2
                },
                t4: {
                    b: 0,
                    result: 0
                }
            },
            round1D = {
                t1: {
                    data: 143567,
                    result: 143567
                },
                t2: {
                    data: 3266.528,
                    result: 3266.5
                },
                t3: {
                    data: 12.67,
                    result: 12.7
                },
                t4: {
                    data: 0,
                    result: 0
                },
                t5: {
                    data: -5600.47,
                    result: -5600.5
                }
            };

        beforeEach(function() {
            cnvs = require('conversions');
        });

        function testBpsToGbps(t) {
            var result = cnvs.bpsToGbps(t.bps);
            expect(result).toEqual(t.result);
        }

        function testBytesToMb(t) {
            var result = cnvs.bytesToMbytes(t.b);
            expect(result).toEqual(t.result);
        }

        function testRound1D(t) {
            var result = cnvs.round1D(t.data);
            expect(result).toEqual(t.result);
        }

        it('testing bps to gbps conversion', function() {
            //normal data points
            testBpsToGbps(bpsToGbps.t1);
            testBpsToGbps(bpsToGbps.t2);

            // decimal data point
            testBpsToGbps(bpsToGbps.t3);

            //negative data point
            testBpsToGbps(bpsToGbps.t4);

            // 0 data point
            testBpsToGbps(bpsToGbps.t5);
        });

        it('testing bytes to mb conversion', function() {
            //normal data points
            testBytesToMb(bytesToMb.t1);
            testBytesToMb(bytesToMb.t2);

            //negative data point
            testBytesToMb(bytesToMb.t3);

            // 0 data point
            testBytesToMb(bytesToMb.t4);

        });

        it('testing rounding to 1 decimal place', function() {
            //normal data points
            testRound1D(round1D.t1);
            testRound1D(round1D.t2);
            testRound1D(round1D.t3);
            testRound1D(round1D.t4);
            testRound1D(round1D.t5);
        });

    });
