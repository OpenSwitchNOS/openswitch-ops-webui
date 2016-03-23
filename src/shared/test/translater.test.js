/*
 (C) Copyright 2015 Hewlett Packard Enterprise Development LP

    Licensed under the Apache License, Version 2.0 (the 'License'); you may
    not use this file except in compliance with the License. You may obtain
    a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed from in writing, software
    distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
    License for the specific language governing permissions and limitations
    under the License.
*/

/*global describe, it, expect */

import Translater from '../translater.js';

describe('translater', () => {

  it('from', () => {
    const ts = new Translater({
      upDown: {
        up: 'up', down: 'down', DEFAULT: 'down',
      },
      onOff: {
        on: 'on', off: 'off',
      },
      powerStatus: {
        ok: { text: 'ok', status: 'ok' },
        'fault_input': { text: 'powerFaultInput', status: 'warning' },
        DEFAULT: 'fault_input',
      }
    });

    expect(ts.from('', '')).toEqual('unknown');

    expect(ts.from('upDown', '')).toEqual('down');
    expect(ts.from('upDown', 'up')).toEqual('up');
    expect(ts.from('upDown', 'down')).toEqual('down');

    expect(ts.from('onOff', '')).toEqual('unknown');
    expect(ts.from('onOff', 'on')).toEqual('on');
    expect(ts.from('onOff', 'off')).toEqual('off');

    expect(ts.from('powerStatus', 'fault_input')).toEqual({
      text: 'powerFaultInput', status: 'warning'
    });
    expect(ts.from('powerStatus', 'ok')).toEqual({
      text: 'ok', status: 'ok'
    });
    expect(ts.from('powerStatus', 'what?')).toEqual({
      text: 'powerFaultInput', status: 'warning'
    });
  });

});
