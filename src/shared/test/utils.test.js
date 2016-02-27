/*
 (C) Copyright 2015 Hewlett Packard Enterprise Development LP

    Licensed under the Apache License, Version 2.0 (the 'License'); you may
    not use this file except in compliance with the License. You may obtain
    a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
    License for the specific language governing permissions and limitations
    under the License.
*/

/*global describe, it, expect */

import Utils from 'utils.js';

describe('utils', () => {

  it('handles empty user configuration case', () => {
    const emptyUserConfig = {};
    const expectedResult = {
      autoNeg: 'on',
      duplex: 'full',
      admin: 'down',
      flowCtrl: 'none',
    };
    const result = Utils.normalizeUserCfg(emptyUserConfig);
    expect(result).toEqual(expectedResult);
  });

  it('handles default values case', () => {
    const defaultUserConfig = {
      admin: 'down',
      autoneg: 'on',
      duplex: 'full',
      pause: 'none',
    };
    const result = Utils.normalizeUserCfg(defaultUserConfig);
    expect(result.admin).toEqual('down');
    expect(result.autoNeg).toEqual('on');
    expect(result.duplex).toEqual('full');
    expect(result.flowCtrl).toEqual('none');
  });

  it('handles empty values in user configuration case', () => {
    const UserConfigWithEmptyValues = {
      admin: '',
      autoneg: '',
      duplex: '',
      pause: '',
    };
    const result = Utils.normalizeUserCfg(UserConfigWithEmptyValues);
    expect(result.admin).toEqual('down');
    expect(result.autoNeg).toEqual('on');
    expect(result.duplex).toEqual('full');
    expect(result.flowCtrl).toEqual('none');
  });

  it('handles basic case', () => {
    const basicUserConfig = {
      admin: 'up',
      autoneg: 'off',
      duplex: 'half',
      pause: 'rx',
    };
    const result = Utils.normalizeUserCfg(basicUserConfig);
    expect(result.admin).toEqual('up');
    expect(result.autoNeg).toEqual('off');
    expect(result.duplex).toEqual('half');
    expect(result.flowCtrl).toEqual('rx');
  });

  it('handles missing admin value case', () => {
    const userConfigWithNoAdmin = {
      autoneg: 'off',
      duplex: 'half',
      pause: 'rxtx',
    };
    const expectedResult = {
      admin: 'down',
      autoNeg: 'off',
      duplex: 'half',
      flowCtrl: 'rxtx',
    };
    const result = Utils.normalizeUserCfg(userConfigWithNoAdmin);
    expect(result).toEqual(expectedResult);
  });

  it('handles user configuration with one value case', () => {
    const userConfigOneValue = {
      admin: 'up'
    };
    const expectedResult = {
      admin: 'up',
      autoNeg: 'on',
      duplex: 'full',
      flowCtrl: 'none',
    };
    const result = Utils.normalizeUserCfg(userConfigOneValue);
    expect(result).toEqual(expectedResult);
  });

  it('handles empty userConfig for userCfgForPatch method', () => {
    const emptyUserConfig = {};
    const expectedResult = {};
    const result = Utils.userCfgForPatch(emptyUserConfig);
    expect(result).toEqual(expectedResult);
  });

  it('handles default userConfig case for userCfgForPatch method', () => {
    const defaultUserConfig = {
      admin: 'down',
      autoNeg: 'on',
      duplex: 'full',
      flowCtrl: 'none',
    };
    const expectedResult = {};
    const result = Utils.userCfgForPatch(defaultUserConfig);
    expect(result).toEqual(expectedResult);
  });

  it('handles userConfig with one default value case for userCfgForPatch method', () => {
    const userConfigWithOneDefault = {
      admin: 'down',
    };
    const expectedResult = {};
    const result = Utils.userCfgForPatch(userConfigWithOneDefault);
    expect(result).toEqual(expectedResult);
  });

  it('handles userConfig with all defaults expect one value case for userCfgForPatch method', () => {
    const userConfigWithOneNonDefault = {
      autoNeg: 'on',
      duplex: 'full',
      admin: 'down',
      flowCtrl: 'tx'
    };
    const expectedResult = {
      pause: 'tx',
    };
    const result = Utils.userCfgForPatch(userConfigWithOneNonDefault);
    expect(result).toEqual(expectedResult);
  });
  it('handles basic case for userCfgForPatch method', () => {
    const basicUserConfig = {
      autoNeg: 'off',
      duplex: 'half',
      admin: 'up',
      flowCtrl: 'rxtx'
    };
    const expectedResult = {
      autoneg: 'off',
      duplex: 'half',
      admin: 'up',
      pause: 'rxtx'
    };
    const result = Utils.userCfgForPatch(basicUserConfig);
    expect(result).toEqual(expectedResult);
  });

  it('handles basic case for parseInterface method', () => {
    const infInputBasicCase = {
      'status': {
        'status': {},
        'lacp_status': {},
        'pause': 'rxtx',
        'hw_intf_info': {
          'enet1G': 'true',
          'switch_unit': '0',
          'enet10G': 'true',
          'switch_intf_id': '45',
          'connector': 'SFP_PLUS',
          'pluggable': 'true',
          'max_speed': '10000',
          'mac_addr': '48:0f:cf:af:40:eb',
          'speeds': '1000,10000',
        },
        'mac_in_use': '48:0f:cf:af:40:eb',
        'duplex': 'half',
        'mtu': 1500,
        'link_state': 'up',
        'link_speed': 10000000000,
        'admin_state': 'up',
        'lldp_neighbor_info': {
          'port_description': '45',
          'port_mfs': '0',
          'mgmt_ip_list': '16.93.60.244',
          'port_lastupdate': '56a666f2',
          'chassis_capability_available': 'Bridge, Router',
          'port_lastchange': '56a5223f',
          'port_id': '45',
          'chassis_refcount': '3',
          'power_devicetype': '0',
          'power_powertype': '0',
          'power_supported': '0',
          'power_paircontrol': '0',
          'chassis_id': '48:0f:cf:af:d1:33',
          'port_id_subtype': 'if_name',
          'power_enabled': '0',
          'chassis_capability_enabled': 'Bridge, Router',
          'macphy_autoneg_enabled': ' ',
          'chassis_index': '1',
          'chassis_name': 'demoswitch',
          'port_hidden_in': '0',
          'power_class': '0',
          'port_id_len': '2',
          'mgmt_iface_list': '0',
          'power_priority': '0',
          'chassis_id_len': '6',
          'port_hidden_out': '0',
          'macphy_mau_type': ' ',
          'chassis_ttl': '120',
          'power_source': '0',
          'chassis_protocol': 'LLDP',
          'power_allocated': '0',
          'port_protocol': 'LLDP',
          'port_pvid': '0',
          'macphy_autoneg_advertised': ' ',
          'macphy_autoneg_support': ' ',
          'chassis_id_subtype': 'link_local_addr',
          'power_pairs': '0',
          'power_requested': '0',
        },
        'error': '',
        'pm_info': {
          'vendor_revision': 'B',
          'connector_status': 'supported',
          'supported_speeds': '10000',
          'vendor_oui': '00-0a-0d',
          'vendor_serial_number': 'CN40FRN00X',
          'connector': 'SFP_DAC',
          'max_speed': '10000',
          'cable_technology': 'passive',
          'vendor_name': 'MergeOptics GmbH',
          'vendor_part_number': '10119467-3030LF',
          'cable_length': '3',
        },
        'lacp_current': false,
      },
      'statistics': {
        'link_resets': 3,
        'statistics': {
          'tx_dropped': 5,
          'rx_packets': 18008,
          'rx_bytes': 3186282,
          'tx_errors': 0,
          'rx_crc_err': 0,
          'collisions': 0,
          'rx_errors': 0,
          'tx_bytes': 12450805490,
          'rx_dropped': 0,
          'tx_packets': 94318751,
        },
        'lldp_statistics': {
          'lldp_rx_discard': 1,
          'lldp_insert': 2,
          'lldp_rx_unrecognized': 0,
          'lldp_ageout': 0,
          'lldp_delete': 0,
          'lldp_tx': 14831,
          'lldp_drop': 0,
          'lldp_rx': 14781,
        },
      },
      'configuration': {
        'split_parent': [0],
        'name': '45',
        'other_config': {
          'lacp-aggregation-key': '456',
        },
        'user_config': {
          admin: 'up',
          duplex: 'half',
          pause: 'rxtx',
        },
        'split_children': [0],
        'subintf_parent': [0],
        'external_ids': {},
        'type': 'system',
        'options': {},
      },
    };

    const expectedUserConfig = {
      admin: 'up',
      autoNeg: 'on',
      duplex: 'half',
      flowCtrl: 'rxtx',
    };
    const result = Utils.parseInterface(infInputBasicCase);
    expect(result.mtu).toEqual(1500);
    expect(result.userCfgAdmin).toEqual('up');
    expect(result.id).toEqual('45');
    expect(result.userCfgAutoNeg).toEqual('on');
    expect(result.mac).toEqual('48:0F:CF:AF:40:EB');
    expect(result.connector).toEqual('SFP_DAC');
    expect(result.rxBytes).toEqual(3186282);
    expect(result.linkState).toEqual('up');
    expect(result.userCfg).toEqual(expectedUserConfig);
    expect(result.speed).toEqual(10000000000);
    expect(result.speedFormatted).toEqual('10 Gbps');
    expect(result.adminStateConnector).toEqual('up');
    expect(result.rxErrors).toEqual(0);
    expect(result.duplex).toEqual('half');
    expect(result.userCfg.duplex).toEqual('half');
  });

  it('handles empty user configuration for parseInterface method', () => {
    const infInputWithNoUserConfig = {
      'status': {
        'pause': 'none',
        'hw_intf_info': {
          'switch_intf_id': '12',
          'connector': 'SFP_PLUS',
          'pluggable': 'true',
          'max_speed': '10000',
          'mac_addr': '48:0f:cf:ab:40:ee',
          'speeds': '1000,10000',
        },
        'mac_in_use': '48:0f:cf:ab:40:ee',
        'duplex': 'full',
        'mtu': 9388,
        'link_state': 'down',
        'admin_state': 'down',
        'error': 'admin_down',
        'pm_info': {
          'connector_status': 'unrecognized',
          'connector': 'absent',
        },
      },
      'statistics': {
        'statistics': {
        },
      },
      'configuration': {
        'name': '12',
        'type': 'system',
      },
    };

    const expectedUserConfig = {
      admin: 'down',
      autoNeg: 'on',
      duplex: 'full',
      flowCtrl: 'none',
    };
    const result = Utils.parseInterface(infInputWithNoUserConfig);
    expect(result.mtu).toEqual(9388);
    expect(result.userCfgAdmin).toEqual('down');
    expect(result.id).toEqual('12');
    expect(result.userCfgAutoNeg).toEqual('on');
    expect(result.mac).toEqual('48:0F:CF:AB:40:EE');
    expect(result.connector).toEqual('absent');
    expect(result.rxBytes).toEqual(0);
    expect(result.linkState).toEqual('down');
    expect(result.userCfg).toEqual(expectedUserConfig);
    expect(result.speed).toEqual('');
    expect(result.speedFormatted).toEqual('');
    expect(result.adminStateConnector).toEqual('down');
    expect(result.rxErrors).toEqual(0);
    expect(result.duplex).toEqual('');
    expect(result.userCfg.duplex).toEqual('full');
  });

  it('handles connector absent admin up for parseInterface method', () => {
    const infInput = {
      'status': {
        'pause': 'rxtx',
        'hw_intf_info': {
          'switch_intf_id': '36',
          'connector': 'SFP_PLUS',
          'pluggable': 'true',
          'max_speed': '10000',
          'mac_addr': '48:0f:cf:ab:40:ee',
          'speeds': '1000,10000',
        },
        'mac_in_use': '48:0f:cf:ab:40:ee',
        'duplex': 'full',
        'mtu': 9388,
        'link_state': 'down',
        'admin_state': 'up',
        'error': '',
      },
      'statistics': {
        'statistics': {
        },
      },
      'configuration': {
        'name': '36',
        'type': 'system',
        'user_config': {
          'admin': 'up',
          'pause': 'rxtx',
        },
      },
    };

    const expectedUserConfig = {
      admin: 'up',
      autoNeg: 'on',
      duplex: 'full',
      flowCtrl: 'rxtx',
    };
    const result = Utils.parseInterface(infInput);
    expect(result.mtu).toEqual(9388);
    expect(result.userCfgAdmin).toEqual('up');
    expect(result.id).toEqual('36');
    expect(result.userCfgFlowCtrl).toEqual('rxtx');
    expect(result.mac).toEqual('48:0F:CF:AB:40:EE');
    expect(result.connector).toEqual('absent');
    expect(result.rxBytes).toEqual(0);
    expect(result.linkState).toEqual('down');
    expect(result.userCfg).toEqual(expectedUserConfig);
    expect(result.speed).toEqual(0);
    expect(result.speedFormatted).toEqual('0 bps');
    expect(result.adminStateConnector).toEqual('up');
    expect(result.rxErrors).toEqual(0);
    expect(result.duplex).toEqual('full');
    expect(result.userCfg.duplex).toEqual('full');
  });

  it('handles connector absent admin state down in status  for parseInterface method', () => {
    const infInput = {
      'status': {
        'pause': 'tx',
        'hw_intf_info': {
          'switch_intf_id': '23',
          'connector': 'SFP_PLUS',
          'pluggable': 'true',
          'max_speed': '10000',
          'mac_addr': '48:0f:cf:ab:40:ee',
          'speeds': '1000,10000',
        },
        'mac_in_use': '48:0f:cf:ab:40:ee',
        'duplex': 'half',
        'mtu': 6000,
        'link_state': 'down',
        'admin_state': 'down',
        'error': 'admin_down',
      },
      'statistics': {
        'statistics': {
        },
      },
      'configuration': {
        'name': '23',
        'type': 'system',
        'user_config': {
          'admin': 'up',
          'duplex': 'half',
          'pause': 'tx',
        },
      },
    };

    const expectedUserConfig = {
      admin: 'up',
      autoNeg: 'on',
      duplex: 'half',
      flowCtrl: 'tx',
    };
    const result = Utils.parseInterface(infInput);
    expect(result.mtu).toEqual(6000);
    expect(result.userCfgAdmin).toEqual('up');
    expect(result.id).toEqual('23');
    expect(result.userCfgFlowCtrl).toEqual('tx');
    expect(result.mac).toEqual('48:0F:CF:AB:40:EE');
    expect(result.connector).toEqual('absent');
    expect(result.rxBytes).toEqual(0);
    expect(result.linkState).toEqual('down');
    expect(result.userCfg).toEqual(expectedUserConfig);
    expect(result.speed).toEqual('');
    expect(result.speedFormatted).toEqual('');
    expect(result.adminStateConnector).toEqual('downAbsent');
    expect(result.rxErrors).toEqual(0);
    expect(result.duplex).toEqual('');
    expect(result.userCfg.duplex).toEqual('half');
  });
});
