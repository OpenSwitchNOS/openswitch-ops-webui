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
    execute_request, get_switch_ip,
    get_json, rest_sanity_check, login
)

from os import environ
from time import sleep

import json
import http.client


# Topology definition. the topology contains two back to back switches
# having four links between them.


TOPOLOGY = """
# +-------+     +-------+
# |  ops1  <----->  hs1  |
# +-------+     +-------+

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


NUM_OF_SWITCHES = 1
NUM_HOSTS_PER_SWITCH = 0

TRUE = "true"
FALSE = "false"

ECMP_PATCH = [{"op": "add", "path": "/ecmp_config", "value": {"key": "val"}}]

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
    if cookie_header is None:
        cookie_header = login(SWITCH_IP)

    def cleanup():
        global cookie_header
        environ["https_proxy"] = proxy
        cookie_header = None

    request.addfinalizer(cleanup)


@fixture(scope="module")
def sanity_check():
    sleep(2)
    rest_sanity_check(SWITCH_IP)


@mark.gate
@mark.platform_incompatible(['ostl'])
def test_initial_config(netop_login, topology, step, sanity_check):
    # Verify data
    status_code, response_data = execute_request(
        PATH, "GET", None, SWITCH_IP, False,
        xtra_header=cookie_header
    )

    assert status_code == http.client.OK, "Failed to query ecmp config "
    json_data = get_json(response_data)
    assert "ecmp" not in list(json_data["configuration"]), \
        "Default ECMP configuration data is non blank"
    step("### ECMP default configuration data validated ###\n")


@mark.gate
@mark.platform_incompatible(['ostl'])
def test_ecmp_enable(netop_login, topology, step, sanity_check):

    # enable ecmp
    ECMP_PATCH[0]["value"]["enabled"] = (
        ECMP_PATCH[0]["value"].pop(list(ECMP_PATCH[0]["value"])[0])
    )
    ECMP_PATCH[0]["value"]["enabled"] = TRUE

    status_code, response_data = execute_request(
        PATH, "PATCH", json.dumps(ECMP_PATCH), SWITCH_IP,
        False, xtra_header=cookie_header
    )

    assert status_code == http.client.NO_CONTENT, "Error patching a ecmp " \
        "enable Status code: %s Response data: %s " % (status_code,
                                                       response_data)
    step("### Enable ECMP Patched. Status code is 204 NO CONTENT  ###\n")

    # Verify data
    status_code, response_data = execute_request(
        PATH, "GET", None, SWITCH_IP, False,
        xtra_header=cookie_header
    )

    assert status_code == http.client.OK, "Failed to query ecmp config"
    json_data = get_json(response_data)
    assert json_data["configuration"]["ecmp_config"]["enabled"] == TRUE, \
        "ECMP enable failed"
    step("### ECMP enable validated ###\n")


@mark.gate
@mark.platform_incompatible(['ostl'])
def test_ecmp_disable(netop_login, topology, step, sanity_check):

    # disable ecmp
    ECMP_PATCH[0]["value"]["enabled"] = (
        ECMP_PATCH[0]["value"].pop(list(ECMP_PATCH[0]["value"])[0])
    )
    ECMP_PATCH[0]["value"]["enabled"] = FALSE

    status_code, response_data = execute_request(
        PATH, "PATCH", json.dumps(ECMP_PATCH), SWITCH_IP,
        False, xtra_header=cookie_header
    )

    assert status_code == http.client.NO_CONTENT, \
        "Error patching a ecmp disable Status code: %s Response data: %s " \
        % (status_code, response_data)
    step("### Disable ECMP Patched. Status code is 204 NO CONTENT  ###\n")

    # Verify data
    status_code, response_data = execute_request(
        PATH, "GET", None, SWITCH_IP, False,
        xtra_header=cookie_header
    )

    assert status_code == http.client.OK, "Failed to query ecmp config"
    json_data = get_json(response_data)
    assert json_data["configuration"]["ecmp_config"]["enabled"] == FALSE, \
        "ECMP disable failed"
    step("### ECMP disable validated ###\n")


@mark.gate
@mark.platform_incompatible(['ostl'])
def test_ecmp_dstip_enable(netop_login, topology, step, sanity_check):

    # enable ecmp dest ip

    ECMP_PATCH[0]["value"]["hash_dstip_enabled"] = (
        ECMP_PATCH[0]["value"].pop(list(ECMP_PATCH[0]["value"])[0])
    )
    ECMP_PATCH[0]["value"]["hash_dstip_enabled"] = TRUE

    status_code, response_data = execute_request(
        PATH, "PATCH", json.dumps(ECMP_PATCH), SWITCH_IP,
        False, xtra_header=cookie_header
    )

    assert status_code == http.client.NO_CONTENT, \
        "Error patching ecmp dest ip enable Status code: " \
        "%s Response data: %s " % (status_code, response_data)
    step("### Enable Dest IP ECMP Patched. "
         "Status code is 204 NO CONTENT  ###\n")

    # Verify data
    status_code, response_data = execute_request(
        PATH, "GET", None, SWITCH_IP, False,
        xtra_header=cookie_header
    )

    assert status_code == http.client.OK, "Failed to query ecmp config"
    json_data = get_json(response_data)
    assert json_data["configuration"]["ecmp_config"]["hash_dstip_enabled"] \
        == TRUE, "ECMP dest IP enable failed"
    step("### ECMP dest IP enable validated ###\n")


@mark.gate
@mark.platform_incompatible(['ostl'])
def test_ecmp_dstip_disable(netop_login, topology, step, sanity_check):

    # disable ecmp dest ip

    ECMP_PATCH[0]["value"]["hash_dstip_enabled"] = (
        ECMP_PATCH[0]["value"].pop(list(ECMP_PATCH[0]["value"])[0])
    )
    ECMP_PATCH[0]["value"]["hash_dstip_enabled"] = FALSE

    status_code, response_data = execute_request(
        PATH, "PATCH", json.dumps(ECMP_PATCH), SWITCH_IP,
        False, xtra_header=cookie_header
    )

    assert status_code == http.client.NO_CONTENT, \
        "Error patching ecmp dest ip disable Status code:" \
        "%s Response data: %s " % (status_code, response_data)
    step("### Disable Dest IP ECMP Patched. "
         "Status code is 204 NO CONTENT  ###\n")

    # Verify data
    status_code, response_data = execute_request(
        PATH, "GET", None, SWITCH_IP, False,
        xtra_header=cookie_header
    )

    assert status_code == http.client.OK, "Failed to query ecmp config"
    json_data = get_json(response_data)
    assert json_data["configuration"]["ecmp_config"]["hash_dstip_enabled"] \
        == FALSE, "ECMP dest IP disable failed"
    step("### ECMP dest IP disable validated ###\n")


@mark.gate
@mark.platform_incompatible(['ostl'])
def test_ecmp_srcip_enable(netop_login, topology, step, sanity_check):

    # enable ecmp source ip

    ECMP_PATCH[0]["value"]["hash_srcip_enabled"] = (
        ECMP_PATCH[0]["value"].pop(list(ECMP_PATCH[0]["value"])[0])
    )
    ECMP_PATCH[0]["value"]["hash_srcip_enabled"] = TRUE

    status_code, response_data = execute_request(
        PATH, "PATCH", json.dumps(ECMP_PATCH), SWITCH_IP,
        False, xtra_header=cookie_header
    )

    assert status_code == http.client.NO_CONTENT, \
        "Error patching ecmp source ip enable Status code: " \
        "%s Response data: %s " % (status_code, response_data)
    step("### Enable Source IP ECMP Patched. Status code is "
         "204 NO CONTENT  ###\n")

    # Verify data
    status_code, response_data = execute_request(
        PATH, "GET", None, SWITCH_IP, False,
        xtra_header=cookie_header
    )

    assert status_code == http.client.OK, "Failed to query ecmp config"
    json_data = get_json(response_data)
    assert json_data["configuration"]["ecmp_config"]["hash_srcip_enabled"] \
        == TRUE, "ECMP source IP enable failed"
    step("### ECMP source IP enable validated ###\n")


@mark.gate
@mark.platform_incompatible(['ostl'])
def test_ecmp_srcip_disable(netop_login, topology, step, sanity_check):

    # disable ecmp source ip

    ECMP_PATCH[0]["value"]["hash_srcip_enabled"] = (
        ECMP_PATCH[0]["value"].pop(list(ECMP_PATCH[0]["value"])[0])
    )
    ECMP_PATCH[0]["value"]["hash_srcip_enabled"] = FALSE

    status_code, response_data = execute_request(
        PATH, "PATCH", json.dumps(ECMP_PATCH), SWITCH_IP,
        False, xtra_header=cookie_header
    )

    assert status_code == http.client.NO_CONTENT, \
        "Error patching ecmp source ip disable Status code: %s Response " \
        "data: %s " % (status_code, response_data)
    step("### Disable Source IP ECMP Patched. Status code is 204 "
         "NO CONTENT  ###\n")

    # Verify data
    status_code, response_data = execute_request(
        PATH, "GET", None, SWITCH_IP, False,
        xtra_header=cookie_header
    )

    assert status_code == http.client.OK, "Failed to query ecmp config"
    json_data = get_json(response_data)
    assert json_data["configuration"]["ecmp_config"]["hash_srcip_enabled"] \
        == FALSE, "ECMP source IP disable failed"
    step("### ECMP source IP disable validated ###\n")


@mark.gate
@mark.platform_incompatible(['ostl'])
def test_ecmp_dstport_enable(netop_login, topology, step, sanity_check):

    # enable ecmp dest port

    ECMP_PATCH[0]["value"]["hash_dstport_enabled"] = (
        ECMP_PATCH[0]["value"].pop(list(ECMP_PATCH[0]["value"])[0])
    )
    ECMP_PATCH[0]["value"]["hash_dstport_enabled"] = TRUE

    status_code, response_data = execute_request(
        PATH, "PATCH", json.dumps(ECMP_PATCH), SWITCH_IP,
        False, xtra_header=cookie_header
    )

    assert status_code == http.client.NO_CONTENT, "Error patching ecmp dest " \
        "port enable Status code: %s Response data: %s " \
        % (status_code, response_data)
    step("### Enable Dest port ECMP Patched. Status code is 204 "
         "NO CONTENT  ###\n")

    # Verify data
    status_code, response_data = execute_request(
        PATH, "GET", None, SWITCH_IP, False,
        xtra_header=cookie_header
    )

    assert status_code == http.client.OK, "Failed to query ecmp config"
    json_data = get_json(response_data)
    assert json_data["configuration"]["ecmp_config"]["hash_dstport_enabled"] \
        == TRUE, "ECMP dest port enable failed"
    step("### ECMP dest port enable validated ###\n")


@mark.gate
@mark.platform_incompatible(['ostl'])
def test_ecmp_dstport_disable(netop_login, topology, step, sanity_check):

    # disable ecmp dest port

    ECMP_PATCH[0]["value"]["hash_dstport_enabled"] = (
        ECMP_PATCH[0]["value"].pop(list(ECMP_PATCH[0]["value"])[0])
    )
    ECMP_PATCH[0]["value"]["hash_dstport_enabled"] = FALSE

    status_code, response_data = execute_request(
        PATH, "PATCH", json.dumps(ECMP_PATCH), SWITCH_IP,
        False, xtra_header=cookie_header
    )
    assert status_code == http.client.NO_CONTENT, "Error patching ecmp " \
        "dest ecmp dest port enable Status code: %s Response data: %s " \
        % (status_code, response_data)
    step("### Disable Dest port ECMP Patched. Status code is 204 "
         "NO CONTENT  ###\n")

    # Verify data
    status_code, response_data = execute_request(
        PATH, "GET", None, SWITCH_IP, False,
        xtra_header=cookie_header
    )

    assert status_code == http.client.OK, "Failed to query ecmp config"
    json_data = get_json(response_data)
    assert json_data["configuration"]["ecmp_config"]["hash_dstport_enabled"] \
        == FALSE, "ECMP dest port disable failed"
    step("### ECMP dest port disable validated ###\n")


@mark.gate
@mark.platform_incompatible(['ostl'])
def test_ecmp_srcport_enable(netop_login, topology, step, sanity_check):

    # enable ecmp source port

    ECMP_PATCH[0]["value"]["hash_srcport_enabled"] = (
        ECMP_PATCH[0]["value"].pop(list(ECMP_PATCH[0]["value"])[0])
    )
    ECMP_PATCH[0]["value"]["hash_srcport_enabled"] = TRUE

    status_code, response_data = execute_request(
        PATH, "PATCH", json.dumps(ECMP_PATCH), SWITCH_IP,
        False, xtra_header=cookie_header
    )

    assert status_code == http.client.NO_CONTENT, "Error patching ecmp src " \
        "ecmp source port enable Status code: %s Response data: %s " \
        % (status_code, response_data)
    step("Enable Source Port ECMP Patched. Status code is 204 "
         "NO CONTENT\n")

    # Verify data
    status_code, response_data = execute_request(
        PATH, "GET", None, SWITCH_IP, False,
        xtra_header=cookie_header
    )

    assert status_code == http.client.OK, "Failed to query ecmp config"
    json_data = get_json(response_data)
    assert json_data["configuration"]["ecmp_config"]["hash_srcport_enabled"] \
        == TRUE, "ECMP source port enable failed"
    step("### ECMP source port enable validated ###\n")


@mark.gate
@mark.platform_incompatible(['ostl'])
def test_ecmp_srcport_disable(netop_login, topology, step, sanity_check):

    # disable ecmp source port

    ECMP_PATCH[0]["value"]["hash_srcport_enabled"] = (
        ECMP_PATCH[0]["value"].pop(list(ECMP_PATCH[0]["value"])[0])
    )
    ECMP_PATCH[0]["value"]["hash_srcport_enabled"] = FALSE

    status_code, response_data = execute_request(
        PATH, "PATCH", json.dumps(ECMP_PATCH), SWITCH_IP,
        False, xtra_header=cookie_header
    )

    assert status_code == http.client.NO_CONTENT, "Error patching ecmp src " \
        "ecmp source port disable Status code: %s Response data: %s " \
        % (status_code, response_data)
    step("Disable Source Port ECMP Patched. Status code is 204 "
         "NO CONTENT\n")

    # Verify data
    status_code, response_data = execute_request(
        PATH, "GET", None, SWITCH_IP, False,
        xtra_header=cookie_header
    )

    assert status_code == http.client.OK, "Failed to query ecmp config"
    json_data = get_json(response_data)
    assert json_data["configuration"]["ecmp_config"]["hash_srcport_enabled"] \
        == FALSE, "ECMP source port disable failed"
    step("### ECMP source port disable validated ###\n")


@mark.gate
@mark.platform_incompatible(['ostl'])
def test_ecmp_reshash_enable(netop_login, topology, step, sanity_check):

    # enable ecmp resilient hash

    ECMP_PATCH[0]["value"]["resilient_hash_enabled"] = (
        ECMP_PATCH[0]["value"].pop(list(ECMP_PATCH[0]["value"])[0])
    )
    ECMP_PATCH[0]["value"]["resilient_hash_enabled"] = TRUE

    status_code, response_data = execute_request(
        PATH, "PATCH", json.dumps(ECMP_PATCH), SWITCH_IP,
        False, xtra_header=cookie_header
    )

    assert \
        status_code == http.client.NO_CONTENT, "Error patching ecmp " \
        "resilient hash enable Status code: %s Response data: %s " \
        % (status_code, response_data)
    step("### Enable Resilient Hash ECMP Patched. Status code is 204 "
         "NO CONTENT  ###\n")

    # Verify data
    status_code, response_data = execute_request(
        PATH, "GET", None, SWITCH_IP, False,
        xtra_header=cookie_header)

    assert status_code == http.client.OK, "Failed to query ecmp config"
    json_data = get_json(response_data)
    assert \
        json_data["configuration"]["ecmp_config"]["resilient_hash_enabled"] \
        == TRUE, "ECMP resilient hash enable failed"
    step("### ECMP resilient hash enable validated ###\n")


@mark.gate
@mark.platform_incompatible(['ostl'])
def test_ecmp_reshash_disable(netop_login, topology, step, sanity_check):
    # disable ecmp resilient hash
    ECMP_PATCH[0]["value"]["resilient_hash_enabled"] = (
        ECMP_PATCH[0]["value"].pop(list(ECMP_PATCH[0]["value"])[0])
    )
    ECMP_PATCH[0]["value"]["resilient_hash_enabled"] = FALSE

    status_code, response_data = execute_request(
        PATH, "PATCH", json.dumps(ECMP_PATCH), SWITCH_IP,
        False, xtra_header=cookie_header
    )

    assert \
        status_code == http.client.NO_CONTENT, \
        "Error patching ecmp resilient hash disable Status code:" \
        "%s Response data: %s " % (status_code, response_data)
    step("### Disable Resilient Hash ECMP Patched. Status code is 204 "
         "NO CONTENT  ###\n")

    # Verify data
    status_code, response_data = execute_request(
        PATH, "GET", None, SWITCH_IP, False,
        xtra_header=cookie_header)

    assert status_code == http.client.OK, "Failed to query ecmp config"
    json_data = get_json(response_data)
    assert \
        json_data["configuration"]["ecmp_config"]["resilient_hash_enabled"] \
        == FALSE, "ECMP resilient hash disable failed"
    step("### ECMP resilient hash disable validated ###\n")
