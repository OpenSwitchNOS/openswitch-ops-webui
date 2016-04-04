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

function bpsToString(bps) {
  if (bps === null || isNaN(bps)) {
    return '';
  }

  if (bps >= 1000000000) {
    //Formula : Gigabits per second = bits per second ÷ 1,000,000,000
    return `${(bps / 1000000000)} Gbps`;
  }

  if (bps >= 1000000) {
    //Formula : Megabytes per second = bits per second ÷ 1,000,000
    return `${(bps / 1000000)}  Mbps`;
  }

  if (bps >= 1000) {
    //Formula: Kilobytes per second = bits per second ÷ 1,000
    return `${bps} Kbps`;
  }

  if (bps > 0) {
    // 0 - 999 bps
    return `${bps} bps`;
  }

  return `${bps} bps`;
}


function mbpsToString(mbps) {
  if (mbps === null || isNaN(mbps)) {
    return '';
  }
  return bpsToString(mbps * 1000000);
}

function toCommaString(x) {
  if (x === null || isNaN(x)) {
    return '';
  }
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export default {
  bpsToString,
  mbpsToString,
  toCommaString,
};
