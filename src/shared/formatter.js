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

function bpsToString(bitsPerSecond) {
  if (isNaN(bitsPerSecond)) {
    throw new Error('Bits Per Second should be a Number');
  }
  if (bitsPerSecond>=1000000000) {
    //Formula : Gigabits per second = bits per second ÷ 1,000,000,000
    return `${(bitsPerSecond/1000000000)} Gbps`;
  } else if (bitsPerSecond>=1000000) {
    //Formula : Megabytes per second = bits per second ÷ 1,000,000
    return `${(bitsPerSecond/1000000)}  Mbps`;
  } else if (bitsPerSecond>=1000) {
    //Formula: Kilobytes per second = bits per second ÷ 1,000
    return `${bitsPerSecond} Kbps`;
  } else if (bitsPerSecond>0) {
    // 0 - 999 bps
    return `${bitsPerSecond} bps`;
  }
  return `${bitsPerSecond} bps`;
}


function mbpsToString(megaBitsPerSecond) {
  if (isNaN(megaBitsPerSecond)) {
    throw new Error('Bits Per Second should be a Number');
  }
  const stringToBeReturned = bpsToString(megaBitsPerSecond*1000000);
  return stringToBeReturned;
}

export default {
  bpsToString,
  mbpsToString,
};
