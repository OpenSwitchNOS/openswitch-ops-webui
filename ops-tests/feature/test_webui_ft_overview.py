# -*- coding: utf-8 -*-
# (C) Copyright 2016 Hewlett Packard Enterprise Development LP
# All Rights Reserved.
#
#    Licensed under the Apache License, Version 2.0 (the "License"); you may
#    not use this file except in compliance with the License. You may obtain
#    a copy of the License at
#
#         http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
#    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
#    License for the specific language governing permissions and limitations
#    under the License.
#
##########################################################################

from pytest import fixture, mark

from rest_utils import (
    execute_request, get_switch_ip, get_json, rest_sanity_check,
    login, get_server_crt, remove_server_crt
)

from os import environ
from time import sleep

import http.client


# Topology definition. the topology contains two back to back switches
# having four links between them.


TOPOLOGY = """
# +-------+     +--------+
# |  ops1  <----->  hs1  |
# +-------+     +--------+

# Nodes
[type=openswitch name="Switch 1"] ops1
[type=oobmhost name="Host 1"] hs1

# Ports
[force_name=oobm] ops1:sp1

# Links
ops1:sp1 -- hs1:1
"""


SWITCH_IP = None
cookie_header = None
proxy = None
PATHBASE = None
PATHSYS = None


NUM_OF_SWITCHES = 1
NUM_HOSTS_PER_SWITCH = 0

switches = []


@fixture()
def netop_login(request, topology):
    global cookie_header, SWITCH_IP, proxy, PATHBASE, PATHSYS
    PATHBASE = "/rest/v1/system/subsystems/base"
    PATHSYS = "/rest/v1/system"
    cookie_header = None
    ops1 = topology.get("ops1")
    assert ops1 is not None
    switches = [ops1]
    if SWITCH_IP is None:
        SWITCH_IP = get_switch_ip(switches[0])
    proxy = environ["https_proxy"]
    environ["https_proxy"] = ""
    get_server_crt(switches[0])
    if cookie_header is None:
        cookie_header = login(SWITCH_IP)

    def cleanup():
        global cookie_header
        environ["https_proxy"] = proxy
        cookie_header = None
        remove_server_crt()

    request.addfinalizer(cleanup)


@fixture(scope="module")
def sanity_check(topology):
    ops1 = topology.get("ops1")
    assert ops1 is not None
    switches = [ops1]
    sleep(2)
    get_server_crt(switches[0])
    rest_sanity_check(SWITCH_IP)


def overview_data(step):
    step("\n########## Test to Validate Base Info ##########\n")
    # Get data
    status_code, response_data = execute_request(
        PATHBASE, "GET", None, SWITCH_IP, False,
        xtra_header=cookie_header)

    assert status_code == http.client.OK, "Failed to get base information"

    # Verify Data
    json_data = get_json(response_data)
    other_info = json_data["status"]["other_info"]

    required_keys = {'Product Name', 'part_number', 'onie_version',
                     'base_mac_address', 'serial_number', 'vendor',
                     'max_interface_speed', 'max_transmission_unit',
                     'interface_count'}

    for key in required_keys:
        assert key in other_info, "Missing key %s" % key

    step("\n########## Base Data Validated ##########\n")

    step("\n########## Test to Validate System Info ##########\n")
    # Get data
    status_code, response_data = execute_request(
        PATHSYS, "GET", None, SWITCH_IP, False,
        xtra_header=cookie_header
    )
    assert status_code == http.client.OK, "Failed to get base information"

    # Verify Data
    json_data = get_json(response_data)
    system_config = json_data["configuration"]
    system_status = json_data["status"]

    assert 'hostname' in system_config, "Missing key %s" % key
    assert 'switch_version' in system_status, "Missing key %s" % key

    step("\n########## System Data Validated ##########\n")


@mark.gate
@mark.platform_incompatible(['ostl'])
def test_webui_ft_overview(topology, step, netop_login, sanity_check):
    overview_data(step)
