/*
 * Calculations tests
 * @author Kelsey Dedoshka
 * @author Frank Wood
 */

describe('Test suite for calculations', function() {
        var calcs,
            test1 = {
                prev: 100000,
                curr: 12345678,
                speed: 100000000,
                interval: 5000,
                resultToFixed: '19.59'
            },
            test2 = {
                prev: 0,
                curr: 3451234,
                speed: 1000000000,
                interval: 5000,
                resultToFixed: '0.55'
            },
            test3 = {
                prev: 45673,
                curr: 0,
                speed: 1000000000,
                interval: 5000,
                resultToFixed: '0.00'

            },
            test4 = {
                prev: 3498764,
                curr: 8764509,
                speed: 0,
                interval: 5000,
                resultToFixed: '0.00'
            },
            test5 = {
                prev: '4562347',
                curr: '68723456',
                speed: '100000000',
                interval: 5000,
                resultToFixed: '100.00'
            },
            test6 = {
                prev: 4567123,
                curr: 764,
                speed: 1000000000,
                interval: 0,
                resultToFixed: '0.00'
            };

        beforeEach(function() {
            calcs = require('calculations');
        });

        function doTest(t) {
            var result = calcs.calcUtil(t.prev, t.curr, t.speed, t.interval);
            expect(result.toFixed(2)).toEqual(t.resultToFixed);
        }

        it('handles 2 normal data points', function() {
            doTest(test1);
        });

        it('handles prev 0', function() {
            doTest(test2);
        });

        it('handles curr 0', function() {
            doTest(test3);
        });

        it('handles speed 0', function() {
            doTest(test4);
        });

        it('handles string parameters and above 100%', function() {
            doTest(test5);
        });

        it('handles interval as 0', function() {
            doTest(test6);
        });

    });
