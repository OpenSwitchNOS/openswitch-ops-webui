/*
 * Test.
 * @author Frank Wood
 */

describe('Test Suite For i18n', function() {

    var I18n = require('i18n'),
        lang = {
            locale: 'en-US',
            messages: {
                vlan: 'VLAN',
                vlans: 'VLANs',
                subSection1: {
                    subKey1: 'subVal1',
                    subSection2: {
                        subKey2: 'subVal2'
                    }
                }
            }
        };

    function text(key) {
        return I18n.text(key, lang);
    }

    it('handles keys & paths, unknown keys & paths', function() {
        expect(text('vlan')).toEqual('VLAN');
        expect(text('vlans')).toEqual('VLANs');
        expect(text('scu-rocks!')).toEqual('~scu-rocks!~');
        expect(text('subSection.bogus')).toEqual('~subSection.bogus~');
        expect(text('subSection1.subKey1')).toEqual('subVal1');
        expect(text('subSection1.subSection2.subKey2')).toEqual('subVal2');
    });

    it('has the correct default locale', function() {
        expect(I18n.locale).toEqual('en-US');
    });

});
