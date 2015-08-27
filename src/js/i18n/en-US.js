/*
 * Localization for en-US.
 * @author Frank Wood
 * @author Al Harrington
 */

module.exports = {

    locale: 'en-US',

    messages: {

        // General text (try to keep in alpha order).
        close: 'Close',
        user: 'User',
        errReqUrl: 'Request',
        errMsg: 'Error',

        // Navigation groups.
        general: 'General',
        ports: 'Ports',
        vlans: 'VLANs',
        routing: 'Routing',
        partNum: 'Part #',
        serialNum: 'Serial #',
        hostName: 'Hostname',
        test: 'Test',

        // Errors.
        err: {
        },

        // View specific text.
        views: {
            dashboard: {
                name: 'Overview',
                systemInfo: 'Information',
                systemStatus: 'Status',
                productName: 'Product',
                baseMac: 'Base MAC',
                version: 'Version',
                onieVersion: 'ONIE Version',
                vendor: 'Vendor',
                upTime: 'Up Time',
                error: 'Error',
                warning: 'Warning',
                ok: 'OK',
                fanStatus: 'Fans',
                fanFault: 'Fault',
                fanUninitialized: 'Uninitialized',
                powerSupplyLabel: 'Power supply',
                powerFaultInput: 'Input Fault',
                powerFaultOutput: 'Output Fault',
                powerAbsent: 'Absent',
                cpu: 'CPU Load',
                memory: 'Memory',
                memoryUnits: 'GB',
                storage: 'Storage',
                storageUnits: 'GB',
                temp: 'Temperatures',
                tempUnits: 'C',
                portTopUtil: 'Top Port Utilization',
                vlanTopUtil: 'Top VLAN Utilization',
                port: 'Port',
                vlan: 'VLAN',
                tx: 'Tx',
                rx: 'Rx',
                txRx: ''
            },
            systemMonitor: {
                name: 'System Monitor',
                cpu: 'CPU Load',
                memory: 'Memory',
                storage: 'Storage',
                temperature: 'Temperature',
                gb: 'GB',
                deg: 'C'
            },
            portMonitor: {
                name: 'Monitor',
                portUtil: 'Port Utilization - Port ',
            },
            portMgmt: {
                name: 'Management',
                boxGraphic: 'Status',
                allInterfaces: 'Interfaces',
                th: {
                    name: 'Name',
                    adminState: 'Admin State',
                    linkState: 'Link State',
                    duplex: 'Duplex',
                    speed: 'Speed',
                    connector: 'Connector',
                    vendor: 'Vendor'
                }
            },
            ip: {
                name: 'IP'
            },
            vlanMgmt: {
                name: 'Management',
                boxGraphic: 'VLAN Membership',
                allVlans: 'All VLANs',
                noVlans: 'No VLANs are configured on this port',
                th: {
                    name: 'Name',
                    id: 'ID',
                    status: 'Status',
                    untagged: 'Native-Untagged',
                    tagged: 'Native-Tagged',
                    access: 'Access',
                    trunk: 'Trunk',
                    display: 'Display',
                    vlan: 'VLAN',
                    portType: 'Port Type',
                }
            },
            vlanPortConfig: {
                name: 'Port Config',
                boxGraphic: 'VLANs'
            },
            vlanMonitor: {
                name: 'Monitor'
            },
            staticRoutes: {
                name: 'Static Routes'
            },
            bgp: {
                name: 'BGP'
            },
            test1: {
                name: 'Test1',
                desc: 'Please see "TestView1.jsx"',
                r1c1hdr: 'R1 C1',
                r1c2r1b1hdr: 'R1 C2 R1 B1',
                r1c2r1b2hdr: 'R1 C2 R1 B2',
                r1c2r2b1hdr: 'R1 C2 R2 B1',
                r1c2r2b2hdr: 'R1 C2 R2 B2',
                r2c1hdr: 'R2 C1',
                r2c2hdr: 'R2 C2'
            },
            test2: {
                name: 'Test2',
                desc: 'Please see "TestView2.jsx"',
                r1b1hdr: 'R1 B1',
                r1b2hdr: 'R1 B2',
                r1b3hdr: 'R1 B3',
                r2b1hdr: 'R2 B1',
                r2b2hdr: 'R2 B2'
            },
            test3: {
                name: 'Test3',
                desc: 'Please see "TestView3.jsx"',
                c1hdr: 'C1',
                c1b1: 'C1 R1 B1',
                c1b2: 'C1 R1 B2',
                c1b3: 'C1 R1 B3',
                c2r2: 'C2 R2',
                c2r3hdr: 'C2 R3'
            }
        }

    }
};
