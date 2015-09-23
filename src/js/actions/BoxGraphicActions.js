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

/*
 * Actions for BoxGraphic Data.
 */

var Reflux = require('reflux');

var BoxGraphicActions = Reflux.createActions({
    loadBoxGraphic: { asyncResult: true }
});


// Self-handle the 'loadBoxGraphic' action by requesting server data.
BoxGraphicActions.loadBoxGraphic.listen(function() {

    var data = {
        base: [{
            style: 'alternate',
            middle: {
                numIndexes: 24
            },
            top: [
                {
                    'type': 'group',
                    'start': 1,
                    'end': 47
                }
            ],
            bottom: [
                {
                    'type': 'group',
                    'start': 2,
                    'end': 48
                }
            ],
            extra: {
                indexes: 25,
                ports: null
            }
        },
        {
            style: 'alternate',
            middle: {
                indexes: [49, 52]
            },
            top: [
                {
                    'type': 'single',
                    'num': [49, 52]
                }
            ],
            bottom: [
                {
                    'type': 'single',
                    'num': [50, 53]
                }
            ],
            extra: {
                indexes: 2,
                ports: [51, 54]
            }
        }],
    };

    this.completed(data);

});


module.exports = BoxGraphicActions;
