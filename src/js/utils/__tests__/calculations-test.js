/*
 * Calculations Tests
 * @author Kelsey Dedoshka
 *
 */

describe('Test suite for calculations', function() {
        var calcs;
        var tests = {
            test1: {
                prev: 100000,
                curr: 12345678,
                link: 100000000,
                interval: 5000,
                data: '19.59' //only because toFixed returns a string
            },

            test2: {
                prev: 0,
                curr: 3451234,
                link: 1000000000,
                interval: 5000,
                data: '0.55'
            },

            test3: {
                prev: 45673,
                curr: 0,
                link: 1000000000,
                interval: 5000,
                data: '0.00'

            },

            test4: {
                prev: 3498764,
                curr: 8764509,
                link: 0,
                interval: 5000,
                data: '0.00'
            },

            test5: {
                prev: '4562347',
                curr: '68723456',
                link: '100000000',
                interval: 5000,
                data: '100.00' //only because toFixed returns a string
            },

            test6: {
                prev: 4567123,
                curr: 764,
                link: 1000000000,
                interval: 0,
                data: '0.00'
            }
        };

        beforeEach(function() {
            calcs = require('calculations');
        });

        it('testing full util calculations - 2 normal data points', function() {
            expect(calcs.calcUtil(tests.test1.prev, tests.test1.curr, tests.test1.link,
                tests.test1.interval).toFixed(2)).toEqual(tests.test1.data);
        });

        it('testing full util calculations - prev 0, function()', function() {
            expect(calcs.calcUtil(tests.test2.prev, tests.test2.curr, tests.test2.link,
                tests.test2.interval).toFixed(2)).toEqual(tests.test2.data);
        });

        it('testing full util calculations - curr 0, function()', function() {
            expect(calcs.calcUtil(tests.test3.prev, tests.test3.curr, tests.test3.link,
                tests.test3.interval).toFixed(2)).toEqual(tests.test3.data);
        });

        it('testing full util calculations - link 0, function()', function() {
            expect(calcs.calcUtil(tests.test4.prev, tests.test4.curr, tests.test4.link,
                tests.test4.interval).toFixed(2)).toEqual(tests.test4.data);
        });

        it('testing full util calculations - string parameters and above 100%', function() {
            expect(calcs.calcUtil(tests.test5.prev, tests.test5.curr, tests.test5.link,
                tests.test5.interval).toFixed(2)).toEqual(tests.test5.data);
        });

        it('testing interval as 0', function() {
            expect(calcs.calcUtil(tests.test6.prev, tests.test6.curr, tests.test6.link,
                tests.test6.interval).toFixed(2)).toEqual(tests.test6.data);
        });

    });
