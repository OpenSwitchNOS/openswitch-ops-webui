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
# +-----+   +------+   +------+    +-----+
# |     |   |      <--->      |    |     |
# | hs1 <---> ops1 |   | ops2 <----> hs2 |
# |     |   |      <--->      |    |     |
# +-----+   +------+   +------+    +-----+

# Nodes
[type=openswitch name="Switch 1"] ops1
[type=openswitch name="Switch 2"] ops2
[type=oobmhost name="Host 1"] hs1
[type=oobmhost name="Host 2"] hs2

# Ports
[force_name=oobm] ops1:sp1
[force_name=oobm] ops2:sp1

# Links
ops1:sp1 -- hs1:1
ops1:sp2 -- ops2:sp2
ops1:sp3 -- ops2:sp3
ops2:sp1 -- hs2:1
"""

SWITCH_IP_1 = None
SWITCH_IP_2 = None
COOKIE_HEADER_1 = None
COOKIE_HEADER_2 = None
proxy = None
PATH = None
PATH_PORTS = None
PATH_INT = None
PORT_PATH = None
INT_PATH = None

LACP_KEY_PATCH_INT = {"op": "add",
                      "path": "/other_config",
                      "value": {"lacp-aggregation-key": "1"}}

LACP_KEY_DELETE_PATCH_INT = {"op": "remove",
                             "path": "/other_config/lacp-aggregation-key"}
LAG_PORT_DATA = {
    "configuration": {
        "name": "lag1",
        "interfaces": ["/rest/v1/system/interfaces/1"],
        "other_config": {"lacp-time": "fast"}
    },
    "referenced_by": [{"uri": "/rest/v1/system/bridges/bridge_normal"}]
}

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

VLAN_MODE_PATCH_PRT = {"op": "add", "path": "/vlan_mode", "value": "access"}

ADD = "ADD"
REMOVE = "REMOVE"

LAG_ID = "23"
LAG_NAME = "lag23"
INTERFACES = {"2", "3"}

LACP_AGGREGATION_KEY = "lacp-aggregation-key"

switches = []


@fixture()
def netop_login(request, topology):
    global COOKIE_HEADER_1, SWITCH_IP_1, COOKIE_HEADER_2, SWITCH_IP_2, proxy,\
        PATH, PATH_PORTS, PATH_INT
    PATH = "/rest/v1/system"
    PATH_PORTS = PATH + "/ports"
    PATH_INT = PATH + "/interfaces"
    hs1 = topology.get('hs1')
    assert hs1 is not None
    hs2 = topology.get('hs2')
    assert hs2 is not None
    ops1 = topology.get("ops1")
    assert ops1 is not None
    ops2 = topology.get("ops2")
    assert ops2 is not None
    switches = [ops1, ops2]
    if SWITCH_IP_1 is None:
        SWITCH_IP_1 = get_switch_ip(switches[0])
    if SWITCH_IP_2 is None:
        SWITCH_IP_2 = get_switch_ip(switches[1])
    proxy = environ["https_proxy"]
    environ["https_proxy"] = ""
    get_server_crt(switches[0])
    if COOKIE_HEADER_1 is None:
        COOKIE_HEADER_1 = login(SWITCH_IP_1)
    get_server_crt(switches[1])
    if COOKIE_HEADER_2 is None:
        COOKIE_HEADER_2 = login(SWITCH_IP_2)

    def cleanup():
        global COOKIE_HEADER_1, COOKIE_HEADER_2
        environ["https_proxy"] = proxy
        COOKIE_HEADER_1 = None
        COOKIE_HEADER_2 = None
        remove_server_crt()

    request.addfinalizer(cleanup)


@fixture(scope="module")
def sanity_check(topology):
    ops1 = topology.get("ops1")
    assert ops1 is not None
    ops2 = topology.get("ops2")
    assert ops2 is not None
    switches = [ops1, ops2]
    sleep(2)
    get_server_crt(switches[0])
    rest_sanity_check(get_switch_ip(switches[0]))
    get_server_crt(switches[1])
    rest_sanity_check(get_switch_ip(switches[1]))


def patch_port_int_admin(step, switch, cookie_header):
    global PORT_PATH, INT_PATH
    port_data = copy.deepcopy(PORT_DATA)
    int_data = copy.deepcopy(INT_DATA)
    PORT_PATH = PATH_PORTS + "/1"
    INT_PATH = PATH_INT + "/1"
    step("### Patch Port and Int on Switch " + switch + "###\n")
    # Create port
    status_code, response_data = execute_request(
        PATH_PORTS, "POST", json.dumps(port_data), switch,
        False, xtra_header=cookie_header)

    assert status_code == http.client.CREATED, "Error creating a Port. " \
        "Status code: %s Response data: %s " % (status_code, response_data)
    step("### Port Created. Status code is 201 CREATED  ###\n")

    # Verify data
    status_code, response_data = execute_request(
        PORT_PATH, "GET", None, switch, False,
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
        PORT_PATH, "PATCH", json.dumps(ADM_PATCH_PRT), switch,
        False, xtra_header=cookie_header
    )

    assert status_code == http.client.NO_CONTENT, "Error patching a Port " \
        "Status code: %s Response data: %s " % (status_code, response_data)
    step("### Port Patched. Status code is 204 NO CONTENT  ###\n")

    # Verify data
    status_code, response_data = execute_request(
        PORT_PATH, "GET", None, switch, False,
        xtra_header=cookie_header
    )

    assert status_code == http.client.OK, "Failed to query patched Port"
    json_data = get_json(response_data)

    assert json_data["configuration"] == port_data["configuration"], \
        "Configuration data is not equal that posted data"
    step("### Configuration data validated ###\n")

    status_code, response_data = execute_request(
        INT_PATH, "PATCH", json.dumps(ADM_PATCH_INT),
        switch, False, xtra_header=cookie_header
    )

    assert status_code == http.client.NO_CONTENT, "Error patching an " \
        "Interface. Status code: %s Response data: %s " \
        % (status_code, response_data)
    step("### Interface Patched. Status code is 204 NO CONTENT  ###\n")

    # Verify data
    status_code, response_data = execute_request(
        INT_PATH, "GET", None, switch, False,
        xtra_header=cookie_header
    )

    assert status_code == http.client.OK, "Failed to query patched Port"
    json_data = get_json(response_data)

    assert json_data["configuration"] == int_data["configuration"], \
        "Configuration data is not equal that posted data"
    step("### Configuration data validated ###\n")

    step("\n########## End Test Create And Patch Port Int ##########\n")


def patch_other(step, switch, cookie_header):
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
        SWITCH_IP_1, False, xtra_header=cookie_header
    )

    assert status_code == http.client.NO_CONTENT, "Error patching an " \
        "Interface. Status code: %s Response data: %s " \
        % (status_code, response_data)
    step("### Interface Patched. Status code is 204 NO CONTENT  ###\n")

    # Verify data
    status_code, response_data = execute_request(
        INT_PATH, "GET", None, switch, False,
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
        INT_PATH, "PATCH", json.dumps(REMOVE_PATCH), switch,
        False, xtra_header=cookie_header
    )

    assert status_code == http.client.NO_CONTENT, "Error patching an " \
        "Interface. Status code: %s Response data: %s " \
        % (status_code, response_data)
    step("### Interface Patched. Status code is 204 NO CONTENT  ###\n")

    # Verify data
    status_code, response_data = execute_request(
        INT_PATH, "GET", None, switch, False,
        xtra_header=cookie_header
    )

    assert status_code == http.client.OK, "Failed to query patched Port"
    json_data = get_json(response_data)

    assert json_data["configuration"] == int_data["configuration"], \
        "Configuration data is not equal that posted data"
    step("### Configuration data validated ###\n")

    step("\n########## End Test Create And Patch Port Int ##########\n")


def int_admin_up(step, switch, cookie_header, port):
    int_path = PATH_INT + "/" + port

    status_code, response_data = execute_request(
        int_path, "PATCH", json.dumps(ADM_PATCH_INT), switch,
        False, xtra_header=cookie_header)

    assert status_code == http.client.NO_CONTENT, "Error patching an "\
        "Interface. Status code: %s Response data: %s "\
        % (status_code, response_data)
    step("### Interface Patched. Status code is 204 NO CONTENT  ###\n")


def create_topo_no_lag(step, interfaces):
    # set up port 2 and 3 on switch 1
    for interface in interfaces:
        int_admin_up(step, SWITCH_IP_1, COOKIE_HEADER_1, interface)
        int_admin_up(step, SWITCH_IP_2, COOKIE_HEADER_2, interface)


def assign_lacp_aggregation_key_ints(step, switch, cookie_header,
                                     lag_id, interfaces):
    for interface in interfaces:
        assign_lacp_aggregation_key_int(step, switch, cookie_header,
                                        lag_id, interface)


def assign_lacp_aggregation_key_int(step, switch, cookie_header,
                                    lag_id, interface):
    int_path = PATH_INT + "/" + interface
    int_data = copy.deepcopy(LACP_KEY_PATCH_INT)
    int_data["value"][LACP_AGGREGATION_KEY] = lag_id
    status_code, response_data = execute_request(
        int_path,
        "PATCH",
        json.dumps([int_data]),
        switch,
        False,
        xtra_header=cookie_header)

    assert status_code == http.client.NO_CONTENT, "Error patching an "\
        "Interface. Status code: %s Response data: %s "\
        % (status_code, response_data)
    step("### Interface Patched. Status code is 204 NO CONTENT  ###\n")


def set_vlan_mode(step, switch, cookie_header, port, mode):
    port_path = PATH_PORTS + "/" + port
    port_data = copy.deepcopy(VLAN_MODE_PATCH_PRT)
    port_data["value"] = mode
    status_code, response_data = execute_request(
        port_path,
        "PATCH",
        json.dumps([port_data]),
        switch,
        False,
        xtra_header=cookie_header)

    assert status_code == http.client.NO_CONTENT, "Error patching an " \
        "Interface. Status code: %s Response data: %s " \
        % (status_code, response_data)
    step("### VLAN mode Patched. Status code is 204 NO CONTENT  ###\n")


def setup_l2_lag(step, switch, cookie_header, lag_id, interfaces, mode):
    port_data = copy.deepcopy(LAG_PORT_DATA)
    port_data["configuration"]["name"] = "lag" + lag_id
    port_data["configuration"]["admin"] = "up"
    port_data["configuration"]["lacp"] = mode

    # build array of interfaces
    ints = []
    for interface in interfaces:
        ints.append("/rest/v1/system/interfaces/" + interface)
    port_data["configuration"]["interfaces"] = ints
    step("\n########## Switch " + switch + ": Create LAG " +
         lag_id + " ##########\n")
    status_code, response_data = execute_request(
        PATH_PORTS, "POST", json.dumps(port_data), switch, False,
        xtra_header=cookie_header)

    assert status_code == http.client.CREATED, "Error creating a Port.Status" \
        + " code: %s Response data: %s " % (status_code, response_data)
    step("### Port Created. Status code is 201 CREATED  ###\n")
    assign_lacp_aggregation_key_ints(step, switch, cookie_header,
                                     lag_id, interfaces)


def validate_dynamic_lag_created(step, switch, cookie_header, lag_name):
        # assert status bond_hw_handle exists
        # Verify data
        port_path = PATH_PORTS + "/" + lag_name
        step("### Checking switch " + switch + " for LAG: " + lag_name +
             "###\n")
        status_code, response_data = execute_request(
            port_path, "GET",
            None,
            switch,
            False,
            xtra_header=cookie_header)
        assert status_code == http.client.OK, "Falied query: " + lag_name
        json_data = get_json(response_data)
        assert json_data["status"]["lacp_status"], "Lag port not created"
        step("### Switch: " + switch + " - Lag is created ###\n")


def create_l2_dynamic_lag(step):
    create_topo_no_lag(step, INTERFACES)
    setup_l2_lag(step, SWITCH_IP_1, COOKIE_HEADER_1,
                 LAG_ID, INTERFACES, "active")
    set_vlan_mode(step, SWITCH_IP_1, COOKIE_HEADER_1, "lag" + LAG_ID, "trunk")
    setup_l2_lag(step, SWITCH_IP_2, COOKIE_HEADER_2,
                 LAG_ID, INTERFACES, "passive")
    set_vlan_mode(step, SWITCH_IP_2, COOKIE_HEADER_2, "lag" + LAG_ID, "trunk")
    validate_dynamic_lag_created(step, SWITCH_IP_1, COOKIE_HEADER_1, LAG_NAME)
    validate_dynamic_lag_created(step, SWITCH_IP_2, COOKIE_HEADER_2, LAG_NAME)


@mark.gate
@mark.platform_incompatible(['ostl'])
def test_webui_ft_l2_dynamic_lag(topology, step, netop_login, sanity_check):
    create_l2_dynamic_lag(step)
