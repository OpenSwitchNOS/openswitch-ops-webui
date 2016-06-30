# -*- coding: utf-8 -*-
#
# Copyright (C) 2015-2016 Hewlett Packard Enterprise Development LP
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

"""
OpenSwitch Test for vlan related configurations.
"""

from pytest import fixture, mark

from rest_utils import (
    execute_request, get_switch_ip, get_json, rest_sanity_check,
    login, get_server_crt, remove_server_crt
)

from os import environ
from time import sleep

import http.client

from helpers import wait_until_interface_up

# Topology definition. The topology contains two back to back switches and
# a host connected to one of them.


TOPOLOGY = """
# +-------+
# |       |     +--------+     +--------+
# |  hs1  <----->  ops1  <----->  ops2  |
# |       |     +--------+     +--------+
# +-------+

# Nodes
[type=openswitch name="OpenSwitch 1"] ops1
[type=openswitch name="OpenSwitch 2"] ops2
[type=host name="Host 1"] hs1

# Links
hs1:1 -- ops1:if01
ops1:if02 -- ops2:if03
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


switches = []

"""
Test the lldp functionality with a OpenSwitch switch.
    Build a topology of two switches and one host. Connect the two switches
    and then connect the one host two the first switch. Configure the two ports
    on the two switches to exchange lldp packets. Then send REST calls from the
    host to the first switch and parse the rest response making sure (wrt
    lldp) it is acting correctly (i.e. is well formed).
"""


@fixture()
def netop_login(request, topology):
    global COOKIE_HEADER_1, COOKIE_HEADER_2, SWITCH_IP_1, SWITCH_IP_2, proxy, \
        PATH, PATH_INT
    PATH = "/rest/v1/system"
    PATH_INT = PATH + "/interfaces"
    hs1 = topology.get("hs1")
    assert hs1 is not None
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


def setup_lldp(step, ops1, ops2, hs1):

    ops1p1 = ops1.ports['if01']
    ops1p2 = ops1.ports['if02']

    ops2p1 = ops2.ports['if03']

    # Configuring LLDP enabled globally on ops1
    ops1('conf t')
    lldp_feature_enabled = False
    ops1('lldp management-address 16.93.49.9')
    ops1('lldp enable')
    output = ops1('list system', shell='vsctl')
    lines = output.split('\n')
    for line in lines:
        if 'lldp_enable' in line:
            lldp_feature_enabled = True
            print("lldp enabled on ops1")
            break
    assert lldp_feature_enabled, "But failed"
    step("### LLDP Enabled on Switch1 ###\n")

    # Configuring LLDP enabled globally on ops2
    ops2('conf t')
    lldp_feature_enabled_ops2 = False
    ops2('lldp management-address 16.93.49.10')
    ops2('lldp enable')
    output = ops2('list system', shell='vsctl')
    lines = output.split('\n')
    for line in lines:
        if 'lldp_enable' in line:
            lldp_feature_enabled_ops2 = True
            break
    assert lldp_feature_enabled_ops2
    step("### LLDP Enabled on Switch2 ###\n")

    # Configure IP and bring UP host 1 interfaces
    hs1.libs.ip.interface('1', addr='10.0.10.1/24', up=True)

    ops1('set interface {ops1p1} user_config:admin=up'.format(**locals()),
         shell='vsctl')
    ops1('set interface {ops1p2} user_config:admin=up'.format(**locals()),
         shell='vsctl')

    ops2('set interface {ops2p1} user_config:admin=up'.format(**locals()),
         shell='vsctl')

    ops1('interface {ops1p1}'.format(**locals()))
    ops1('no shutdown')
    ops1('ip address 10.0.10.2/24')
    sleep(1)

    ops1('interface {ops1p2}'.format(**locals()))
    ops1('no shutdown')
    ops1('ip address 10.0.20.2/24')
    ops1('exit')
    ops1('exit')
    sleep(1)

    ops2('interface {ops2p1}'.format(**locals()))
    ops2('no shutdown')
    ops2('ip address 10.0.20.3/24')
    ops2('exit')
    ops2('exit')

    step("## Assigned IP Address Successfully## \n")
    # Wait until interfaces are up (ops1)
    for portlbl in [ops1p1, ops1p2]:
        wait_until_interface_up(ops1, portlbl)

    # Wait until interfaces are up (ops2)
    for portlbl in ['1', ops2p1]:
        wait_until_interface_up(ops2, portlbl)

    ops2.libs.ip.add_route('10.0.10.0/24', '10.0.20.2', shell='bash_swns')

    # Set gateway in hosts
    hs1.libs.ip.add_route('default', '10.0.10.2')

    # Wait 30 seconds for lldp packets to flow
    sleep(30)

    # Set static routes in switches
    ping = hs1.libs.ping.ping(1, '10.0.20.3')
    assert ping['transmitted'] == ping['received'] == 1
    step("### Configured IP and ping worked.###\n")

    ops1('conf t')
    ops1('interface {ops1p1}'.format(**locals()))
    ops1('no routing')

    ops1('interface {ops1p2}'.format(**locals()))
    ops1('no routing')
    ops1('exit')
    ops1('exit')
    ops1('show lldp neighbor-info 2')
    sleep(1)

    ops2('conf t')
    ops2('interface {ops2p1}'.format(**locals()))
    ops2('no routing')
    ops2('exit')
    ops2('exit')
    ops2('show lldp neighbor-info 1')
    sleep(1)
    step("### Making all no routing ports")


def rest_lldp_interface(step, switch, cookie_header):
    # Fetching /rest/v1/system/intefaces
    int_path = PATH_INT + "/" + "2"
    step("### GET for url = /rest/v1/system/interfaces/1 ###\n")
    status_code, response_data = execute_request(
        int_path, "GET",
        None,
        switch,
        False,
        xtra_header=cookie_header)
    assert status_code == http.client.OK, "Failed to execute rest cmd"\
        "GET for url=/rest/v1/system/interfaces"
    json_data = get_json(response_data)
    step("### Fetch Success ###\n")

    # TEST 1 - Check to see if LLDP NEIGHBOR INFO TAG IS PRESENT
    step("### Check to see if LLDP NEIGHBOR INFO TAG IS PRESENT ###\n")
    assert json_data["status"]["lldp_neighbor_info"], "No LLDP Neighbor "\
        "info"
    step("###LLDP NEIGHBOR INFO PRESENT ### \n")

    # TEST 2 - Check to see if LLDP NEIGHBOR INFO - IP MGMT TAG IS PRESENT
    step("### Check to see if LLDP NEIGHBOR INFO TAG IS PRESENT ###\n")
    assert json_data["status"]["lldp_neighbor_info"]["mgmt_ip_list"], "No "\
        "MGMT IP PRESENT"
    step("###LLDP MGMT IP PRESENT ### \n")

    # TEST 3 - Check to see if NEIGHBOR INFO - IP MGMT TAG MATCHES EXP VALUE
    try:
        lldp_ip = json_data["status"]["lldp_neighbor_info"]["mgmt_ip_list"]
    except ValueError:
        step('### Value error in Rest GET for mgmt_ip_list ###\n')
    assert lldp_ip == "16.93.49.10", "Failed in checking the GET "\
        "METHOD JSON response validation for mgmt_ip_list value"
    step("### Success in Rest GET for mgmt_ip_list value = expected ###\n")

    # TEST 4 - Check to see if LLDP STATISTICS TAG IS PRESENT
    assert json_data["statistics"]["lldp_statistics"], "Failed in checking "\
        "the GET METHOD JSON response validation for lldp_statistics tag"
    step("###  Success in Rest GET for lldp_statistics tag ###\n")

    # TEST 5 - Check to see if LLDP STATISTICS TAG FOR XMIT IS PRESENT
    assert json_data["statistics"]["lldp_statistics"]["lldp_tx"], "Failed "\
        "in checking the GET METHOD JSON response validation for lldp_tx tag"
    step("### Success in Rest GET for lldp_tx tag ###\n")

    # TEST 6 - Check to see if LLDP STATISTICS TAG FOR XMIT IS > 0
    try:
        lldp_tx = int(json_data["statistics"]["lldp_statistics"]["lldp_tx"])
    except ValueError:
        step("### Value error in Rest GET for lldp_tx ###\n")
    assert lldp_tx != 0, "Failed in checking the GET METHOD JSON "\
        "response validation for lldp_tx value = 0"
    step("### Success in Rest GET - lldp_tx value > 0  ###\n")

    # TEST 7 - Check to see if LLDP STATISTICS TAG FOR RCV IS PRESENT
    assert json_data["statistics"]["lldp_statistics"]["lldp_rx"], "Failed"\
        "in checking the GET METHOD JSON response validation for lldp_rx tag"
    step("### Success in Rest GET for lldp_rx tag ###\n")

    # TEST 8 - Check to see if LLDP STATISTICS TAG FOR RCV > 0
    try:
        lldp_rx = int(json_data["statistics"]["lldp_statistics"]["lldp_rx"])
    except ValueError:
        step("### Value error in Rest GET for lldp_rx ###\n")
    assert lldp_rx != 0, "Failed in checking the GET METHOD JSON "\
        "response validation for lldp_rx value = 0"
    step("### Success in Rest GET - lldp_rx value > 0  ###\n")


def lldp_config(step, ops1, ops2, hs1):
    setup_lldp(step, ops1, ops2, hs1)
    rest_lldp_interface(step, SWITCH_IP_1, COOKIE_HEADER_1)


@mark.gate
@mark.platform_incompatible(['ostl'])
def test_webui_ft_lldp(topology, step, netop_login, sanity_check):
    hs1 = topology.get("hs1")
    assert hs1 is not None
    ops1 = topology.get("ops1")
    assert ops1 is not None
    ops2 = topology.get("ops2")
    assert ops2 is not None

    lldp_config(step, ops1, ops2, hs1)
