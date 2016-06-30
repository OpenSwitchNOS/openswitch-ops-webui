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
import copy

from os import environ
from time import sleep

import json
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
PATH = None
PATH_PORTS = None
PATH_INT = None
PORT_PATH = None
INT_PATH = None


NUM_OF_SWITCHES = 1
NUM_HOSTS_PER_SWITCH = 0

ADM_PATCH_PRT = [{"op": "add",
                  "path": "/admin",
                  "value": "up"}]
ADM_PATCH_INT = [{"op": "add",
                  "path": "/user_config",
                  "value": {"admin": "up"}}]
OTHER_PATCH = [{"op": "add",
                "path": "/user_config",
                "value": {"autoneg": "off",
                          "duplex": "half",
                          "pause": "rxtx"}}]
REMOVE_PATCH = [{"op": "remove",
                 "path": "/user_config"}]
PORT_DATA = {
    "configuration": {
        "name": "1",
        "interfaces": ["/rest/v1/system/interfaces/1"]
    },
    "referenced_by": [{"uri": "/rest/v1/system/bridges/bridge_normal"}]
}

INT_DATA = {
    "configuration": {
        "type": "system",
        "name": "1"
    }
}

switches = []


@fixture()
def netop_login(request, topology):
    global cookie_header, SWITCH_IP, proxy, PATH, PATH_PORTS, PATH_INT
    PATH = "/rest/v1/system"
    PATH_PORTS = PATH + "/ports"
    PATH_INT = PATH + "/interfaces"
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


def patch_port_int_admin(step):
    global PORT_PATH, INT_PATH
    port_data = copy.deepcopy(PORT_DATA)
    int_data = copy.deepcopy(INT_DATA)
    PORT_PATH = PATH_PORTS + "/1"
    INT_PATH = PATH_INT + "/1"
    # Create port
    status_code, response_data = execute_request(
        PATH_PORTS, "POST", json.dumps(port_data), SWITCH_IP,
        False, xtra_header=cookie_header)

    assert (
        status_code == http.client.CREATED, "Error creating a Port. Status"
        " code: %s Response data: %s " % (status_code, response_data)
    )
    step("### Port Created. Status code is 201 CREATED  ###\n")

    # Verify data
    status_code, response_data = execute_request(
        PORT_PATH, "GET", None, SWITCH_IP, False,
        xtra_header=cookie_header
    )

    assert status_code == http.client.OK, "Failed to query added Port"
    json_data = get_json(response_data)

    assert json_data["configuration"] == port_data["configuration"], \
        "Configuration data is not equal that posted data"
    step("### Configuration data validated ###\n")

    step("\n########## Test to Validate Patch Port Int ##########\n")
    port_data["configuration"]["admin"] = "up"
    int_data["configuration"]["user_config"] = {}
    int_data["configuration"]["user_config"]["admin"] = "up"
    status_code, response_data = execute_request(
        PORT_PATH, "PATCH", json.dumps(ADM_PATCH_PRT), SWITCH_IP,
        False, xtra_header=cookie_header
    )

    assert status_code == http.client.NO_CONTENT, "Error patching a Port " \
        "Status code: %s Response data: %s " % (status_code, response_data)
    step("### Port Patched. Status code is 204 NO CONTENT  ###\n")

    # Verify data
    status_code, response_data = execute_request(
        PORT_PATH, "GET", None, SWITCH_IP, False,
        xtra_header=cookie_header
    )

    assert status_code == http.client.OK, "Failed to query patched Port"
    json_data = get_json(response_data)

    assert json_data["configuration"] == port_data["configuration"], \
        "Configuration data is not equal that posted data"
    step("### Configuration data validated ###\n")

    status_code, response_data = execute_request(
        INT_PATH, "PATCH", json.dumps(ADM_PATCH_INT),
        SWITCH_IP, False, xtra_header=cookie_header
    )

    assert status_code == http.client.NO_CONTENT, "Error patching an " \
        "Interface. Status code: %s Response data: %s " \
        % (status_code, response_data)
    step("### Interface Patched. Status code is 204 NO CONTENT  ###\n")

    # Verify data
    status_code, response_data = execute_request(
        INT_PATH, "GET", None, SWITCH_IP, False,
        xtra_header=cookie_header
    )

    assert status_code == http.client.OK, "Failed to query patched Port"
    json_data = get_json(response_data)

    assert json_data["configuration"] == int_data["configuration"], \
        "Configuration data is not equal that posted data"
    step("### Configuration data validated ###\n")

    step("\n########## End Test Create And Patch Port Int ##########\n")


def patch_other(step):
    global INT_PATH
    int_data = copy.deepcopy(INT_DATA)
    INT_PATH = PATH_INT + "/2"
    int_data["configuration"]["name"] = "2"

    # Setup patch
    int_data["configuration"]["user_config"] = {}
    int_data["configuration"]["user_config"]["duplex"] = "half"
    int_data["configuration"]["user_config"]["autoneg"] = "off"
    int_data["configuration"]["user_config"]["pause"] = "rxtx"
    # Patch
    step("\n########## Test to Validate Patch Other ##########\n")
    status_code, response_data = execute_request(
        INT_PATH, "PATCH", json.dumps(OTHER_PATCH),
        SWITCH_IP, False, xtra_header=cookie_header
    )

    assert status_code == http.client.NO_CONTENT, "Error patching an " \
        "Interface. Status code: %s Response data: %s " \
        % (status_code, response_data)
    step("### Interface Patched. Status code is 204 NO CONTENT  ###\n")

    # Verify data
    status_code, response_data = execute_request(
        INT_PATH, "GET", None, SWITCH_IP, False,
        xtra_header=cookie_header
    )

    assert status_code == http.client.OK, "Failed to query patched Port"
    json_data = get_json(response_data)

    assert json_data["configuration"] == int_data["configuration"], \
        "Configuration data is not equal that posted data"
    step("### Configuration data validated ###\n")

    # Remove data
    int_data = copy.deepcopy(INT_DATA)
    int_data["configuration"]["name"] = "2"
    status_code, response_data = execute_request(
        INT_PATH, "PATCH", json.dumps(REMOVE_PATCH), SWITCH_IP,
        False, xtra_header=cookie_header
    )

    assert status_code == http.client.NO_CONTENT, "Error patching an " \
        "Interface. Status code: %s Response data: %s " \
        % (status_code, response_data)
    step("### Interface Patched. Status code is 204 NO CONTENT  ###\n")

    # Verify data
    status_code, response_data = execute_request(
        INT_PATH, "GET", None, SWITCH_IP, False,
        xtra_header=cookie_header
    )

    assert status_code == http.client.OK, "Failed to query patched Port"
    json_data = get_json(response_data)

    assert json_data["configuration"] == int_data["configuration"], \
        "Configuration data is not equal that posted data"
    step("### Configuration data validated ###\n")

    step("\n########## End Test Create And Patch Port Int ##########\n")


@mark.gate
@mark.platform_incompatible(['ostl'])
def test_webui_ft_interface_config(topology, step, netop_login, sanity_check):
    patch_port_int_admin(step)
    patch_other(step)
