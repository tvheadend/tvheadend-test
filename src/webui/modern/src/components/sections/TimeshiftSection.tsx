import React from 'react';
import ConfigForm, { FormField } from '../common/ConfigForm';

const TimeshiftSection: React.FC = () => {
  const fields: FormField[] = [
    {
      key: 'enabled',
      label: 'Timeshift enabled',
      type: 'boolean',
      description: 'Enable timeshift functionality',
    },
    {
      key: 'path',
      label: 'Storage path',
      type: 'text',
      description: 'Directory where timeshift files are stored',
    },
    {
      key: 'max_period',
      label: 'Maximum period (mins)',
      type: 'number',
      description: 'Maximum timeshift period in minutes',
    },
    {
      key: 'max_size',
      label: 'Maximum size (MB)',
      type: 'number',
      description: 'Maximum size of timeshift buffer in MB',
    },
    {
      key: 'unlimited_period',
      label: 'Unlimited time period',
      type: 'boolean',
      description: 'Allow unlimited timeshift period',
    },
    {
      key: 'unlimited_size',
      label: 'Unlimited size',
      type: 'boolean', 
      description: 'Allow unlimited timeshift buffer size',
    },
    {
      key: 'ram_only',
      label: 'Use RAM only',
      type: 'boolean',
      description: 'Store timeshift buffer in RAM only',
    },
    {
      key: 'ram_segment_size',
      label: 'RAM segment size (KB)',
      type: 'number',
      description: 'Size of each RAM segment in KB',
    },
  ];

  return (
    <ConfigForm
      title="Timeshift Configuration"
      url="timeshift/config"
      fields={fields}
    />
  );
};

export default TimeshiftSection;
