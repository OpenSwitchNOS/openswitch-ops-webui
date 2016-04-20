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

export const USER_CFG = 'user_config';

export const ADMIN = 'admin';
export const ADMIN_DEF = 'down';

export const DUPLEX = 'duplex';
export const DUPLEX_DEF = 'full';

export const AUTO_NEG = 'autoneg';
export const AUTO_NEG_DEF = 'on';

export const FLOW_CTRL = 'pause';
export const FLOW_CTRL_DEF = 'none';

export const LANE_SPLIT = 'lane_split';
export const LANE_SPLIT_DEF = '';

export const PORT_ADMIN = 'admin';

export function copyWithoutDefs(uc) {
  const ucCopy = { ...uc };
  if (uc[ADMIN] === ADMIN_DEF) { delete ucCopy[ADMIN]; }
  if (uc[DUPLEX] === DUPLEX_DEF) { delete ucCopy[DUPLEX]; }
  if (uc[AUTO_NEG] === AUTO_NEG_DEF) { delete ucCopy[AUTO_NEG]; }
  if (uc[FLOW_CTRL] === FLOW_CTRL_DEF) { delete ucCopy[FLOW_CTRL]; }
  if (uc[LANE_SPLIT] === LANE_SPLIT_DEF) { delete ucCopy[LANE_SPLIT]; }
  return ucCopy;
}
