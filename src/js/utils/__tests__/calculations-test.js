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
                data: '12.25' //only because toFixed returns a string
            },

            test2: {
                prev: 0,
                curr: 3451234,
                link: 1000000000,
                data: 0 //3.45
            },

            test3: {
                prev: 45673,
                curr: 0,
                link: 1000000000,
                data: 0 //need to fix this

            },

            test4: {
                prev: 3498764,
                curr: 8764509,
                link: 0,
                data: 0
            },

            test5: {
                prev: '4562347',
                curr: '68723456',
                link: '100000000',
                data: '64.16' //only because toFixed returns a string
            }
        };

        beforeEach(function() {
            calcs = require('calculations');
        });

        it('testing full util calculations - 2 normal data points', function() {
            expect(calcs.calcFullUtil(tests.test1.prev, tests.test1.curr, tests.test1.link)
                .toFixed(2)).toEqual(tests.test1.data);
        });

        it('testing full util calculations - prev 0, function()', function() {
            expect(calcs.calcFullUtil(tests.test2.prev, tests.test2.curr, tests.test2.link))
                .toEqual(tests.test2.data);
        });

        it('testing full util calculations - curr 0, function()', function() {
            expect(calcs.calcFullUtil(tests.test3.prev, tests.test3.curr, tests.test3.link))
                .toEqual(tests.test3.data);
        });

        it('testing full util calculations - link 0, function()', function() {
            expect(calcs.calcFullUtil(tests.test4.prev, tests.test4.curr, tests.test4.link))
                .toEqual(tests.test4.data);
        });

        it('testing full util calculations - string parameters', function() {
            expect(calcs.calcFullUtil(tests.test5.prev, tests.test5.curr, tests.test5.link)
                .toFixed(2)).toEqual(tests.test5.data);
        });

    });
