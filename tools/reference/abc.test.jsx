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

/*global describe, it, expect */

import React from 'react';
import TestUtils from 'react-addons-test-utils';
import AbcComponent from '../abcComponent.jsx';

describe('Abc', () => {

  describe('Component', () => {

    it('renders without problems', () => {
      const c = TestUtils.renderIntoDocument(<AbcComponent data={[0, 1, 2]}/>);
      expect(c).toBeDefined();
    });

    it('correctly displays the prop.data', () => {
      const c = TestUtils.renderIntoDocument(<AbcComponent data={[0, 1, 2]}/>);
      const comp = TestUtils.findRenderedDOMComponentWithTag(c, 'p');
      expect(comp.textContent).toEqual('ABC Component prop.data: 0,1,2');
    });

    it('supports shallow rendering tests', () => {
      const sr = TestUtils.createRenderer();
      sr.render(<AbcComponent data={[0, 1, 2]}/>);
      const comp = sr.getRenderOutput();
      expect(comp.type).toEqual('div');
      expect(comp.props.className).toEqual('abcComponent');
      expect(comp.props.children).toEqual(
        <p>ABC Component prop.data: 0,1,2</p>
      );
    });

  });

});
