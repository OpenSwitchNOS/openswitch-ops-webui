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


export function toTimestamp(millis, utc) {
  const d = new Date(millis);

  const h = utc ? d.getUTCHours() : d.getHours();
  const hs = h < 10 ? `0${h}` : h.toString();

  const m = d.getMinutes();
  const ms = m < 10 ? `0${m}` : m.toString();

  const s = d.getSeconds();
  const ss = s < 10 ? `0${s}` : s.toString();

  const z = d.getMilliseconds();
  const zs = z < 10 ? `00${z}` : z < 100 ? `0${z}` : z.toString();

  return `${hs}:${ms}:${ss}.${zs}`;
}
