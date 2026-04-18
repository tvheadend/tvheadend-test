import React from 'react';
import ConfigDataGrid, { GridColumn } from '../common/ConfigDataGrid';

const ChannelsSection: React.FC = () => {
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
      key: 'name', 
      label: 'Name', 
      type: 'text', 
      width: 200,
      sortable: true,
      filterable: true
    },
    { 
      key: 'number', 
      label: 'Number', 
      type: 'number', 
      width: 80,
      sortable: true,
      filterable: false
    },
    { 
      key: 'icon', 
      label: 'Icon', 
      type: 'text', 
      width: 60,
      sortable: false,
      filterable: false
    },
    { 
      key: 'epgauto', 
      label: 'Auto EPG', 
      type: 'boolean', 
      width: 100,
      sortable: true,
      filterable: false
    },
    { 
      key: 'epg_parent', 
      label: 'EPG Parent', 
      type: 'text', 
      width: 150,
      sortable: true,
      filterable: true
    },
    { 
      key: 'bouquet', 
      label: 'Bouquet', 
      type: 'text', 
      width: 150,
      sortable: true,
      filterable: true
    },
    { 
      key: 'services', 
      label: 'Services', 
      type: 'text', 
      width: 200,
      sortable: false,
      filterable: true
    },
    { 
      key: 'tags', 
      label: 'Tags', 
      type: 'text', 
      width: 150,
      sortable: false,
      filterable: true
    },
    { 
      key: 'dvr_pre_time', 
      label: 'DVR Pre (min)', 
      type: 'number', 
      width: 120,
      sortable: true,
      filterable: false
    },
    { 
      key: 'dvr_pst_time', 
      label: 'DVR Post (min)', 
      type: 'number', 
      width: 120,
      sortable: true,
      filterable: false
    },
    { 
      key: 'autorid', 
      label: 'Auto rid', 
      type: 'boolean', 
      width: 100,
      sortable: true,
      filterable: false
    }
  ];

  return (
    <ConfigDataGrid
      title="Channels"
      titleSingular="Channel"
      url="channel"
      columns={columns}
      canAdd={true}
      canEdit={true}
      canDelete={true}
      canMove={true}
      autoRefresh={true}
      autoRefreshInterval={30}
      helpPage="class/channel"
      pageSize={50}
      supportsPagination={true}
      fields={[
        'enabled',
        'name',
        'number',
        'icon',
        'epgauto',
        'epg_parent',
        'bouquet',
        'services',
        'tags',
        'dvr_pre_time',
        'dvr_pst_time',
        'autorid'
      ]}
    />
  );
};

export default ChannelsSection;
