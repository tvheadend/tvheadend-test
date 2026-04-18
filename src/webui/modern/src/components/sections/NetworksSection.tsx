import React from 'react';
import ConfigDataGrid, { GridColumn } from '../common/ConfigDataGrid';

const NetworksSection: React.FC = () => {
  const columns: GridColumn[] = [
    { 
      key: 'enabled', 
      label: 'Enabled', 
      type: 'boolean', 
      width: 80,
      sortable: true,
      filterable: false
    },
    { 
      key: 'networkname', 
      label: 'Network Name', 
      type: 'text', 
      width: 200,
      sortable: true,
      filterable: true
    },
    { 
      key: 'class', 
      label: 'Type', 
      type: 'select',
      width: 150,
      sortable: true,
      filterable: true,
      options: [
        { key: 'dvb_network_dvbt', val: 'DVB-T Network' },
        { key: 'dvb_network_dvbs', val: 'DVB-S Network' },
        { key: 'dvb_network_dvbc', val: 'DVB-C Network' },
        { key: 'iptv_network', val: 'IPTV Network' },
        { key: 'atsc_network', val: 'ATSC-T Network' },
        { key: 'satip_network', val: 'SAT>IP Network' },
        { key: 'hdhomerun_network', val: 'HDHomeRun Network' },
      ]
    },
    { 
      key: 'pnetworkname', 
      label: 'Provider Network Name', 
      type: 'text', 
      width: 200,
      sortable: true,
      filterable: true
    },
    { 
      key: 'nid', 
      label: 'Network ID', 
      type: 'number', 
      width: 100,
      sortable: true,
      filterable: false
    },
    { 
      key: 'autodiscovery', 
      label: 'Auto discovery', 
      type: 'boolean', 
      width: 120,
      sortable: true,
      filterable: false
    },
    { 
      key: 'skip_initial_scan', 
      label: 'Skip initial scan', 
      type: 'boolean', 
      width: 140,
      sortable: true,
      filterable: false
    },
    { 
      key: 'bouquet', 
      label: 'Bouquet', 
      type: 'boolean', 
      width: 100,
      sortable: true,
      filterable: false
    },
    { 
      key: 'charset', 
      label: 'Character set', 
      type: 'text', 
      width: 120,
      sortable: true,
      filterable: true
    },
    { 
      key: 'num_mux', 
      label: 'Muxes', 
      type: 'number', 
      width: 80,
      sortable: true,
      filterable: false
    },
    { 
      key: 'num_svc', 
      label: 'Services', 
      type: 'number', 
      width: 80,
      sortable: true,
      filterable: false
    },
    { 
      key: 'num_chn', 
      label: 'Channels', 
      type: 'number', 
      width: 80,
      sortable: true,
      filterable: false
    },
    { 
      key: 'scanstatus', 
      label: 'Scan Status', 
      type: 'text', 
      width: 120,
      sortable: true,
      filterable: true
    }
  ];

  return (
    <ConfigDataGrid
      title="Networks"
      titleSingular="Network"
      url="mpegts/network"
      columns={columns}
      canAdd={true}
      canEdit={true}
      canDelete={true}
      canMove={false}
      autoRefresh={true}
      autoRefreshInterval={30}
      helpPage="class/mpegts_network"
      pageSize={50}
      supportsPagination={true}
      fields={[
        'enabled',
        'networkname', 
        'class', 
        'pnetworkname',
        'nid',
        'autodiscovery',
        'skip_initial_scan',
        'bouquet',
        'charset',
        'num_mux',
        'num_svc', 
        'num_chn',
        'scanstatus'
      ]}
    />
  );
};

export default NetworksSection;
