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

/*global describe, it, expect, beforeEach, afterEach */

import { getLocale, setLocale, t } from '../lookup.js';

describe('i18n/lookup', () => {

  let cacheLocale;

  beforeEach(() => {
    cacheLocale = getLocale();
    setLocale({
      LOCALE: 'xx-XX',
      MESSAGES: {
        a: 'A',
        b: 'B',
        c: 'C',
      }
    });
  });

  afterEach(() => {
    setLocale(cacheLocale);
  });

  it('returns the locale', () => {
    expect(getLocale().LOCALE).toEqual('xx-XX');
  });

  it('finds text', () => {
    expect(t('b')).toEqual('B');
  });

  it('returns the key if not found', () => {
    expect(t('aa')).toEqual('~aa~');
  });

});
