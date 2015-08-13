/*
 * Localization for en-US.
 * @author Frank Wood
 */

module.exports = {

    locale: 'en-US',

    messages: {

        // General text (try to keep in alpha order).
        user: 'User',

        // Navigation groups.
        general: 'General',
        ports: 'Ports',
        vlans: 'VLANs',
        monitor: 'Monitor',
        routing: 'Routing',

        // Errors.
        err: {
            dataNotUrls: 'Resulting data is not an array of URLs'
        },

        // View specific text.
        views: {
            dashboard: {
                name: 'Overview',
                system: 'System',
                topPortStats: 'Port Top Talkers',
                info: 'Information',
                productName: 'Product',
                baseMac: 'Base MAC',
                manufacturedOn: 'Manufactured On',
                manufacturer: 'Manufactured By',
                version: 'Version',
                onieVersion: 'ONIE Version',
                partNumber: 'Part #',
                platformName: 'Platform',
                serialNum: 'Serial #',
                vendor: 'Vendor',
                upTime: 'Up Time',
                warning: 'Warning',
                ok: 'OK',
                fanStatus: 'Fan Status',
                powerStatus: 'Power Status',
                cpu: 'CPU Load',
                memory: 'Memory',
                storage: 'Storage',
                temp: 'Temperature',
                portTopUtil: 'Top Port Utilization',
                vlanTopUtil: 'Top VLAN Utilization'
            },
            portMonitor: {
                name: 'Monitor',
                portUtil: 'Port Utilization - Port '
            },
            portConfig: {
                name: 'Config'
            },
            ip: {
                name: 'IP'
            },
            lldp: {
                name: 'LLDP'
            },
            monitor: {
                name: 'Monitor'
            },
            vlans: {
                name: 'VLANs',
                boxGraphic: 'VLANs'
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
