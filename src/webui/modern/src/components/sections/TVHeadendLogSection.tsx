import React from 'react';
import ConfigForm, { FormField } from '../common/ConfigForm';

const TVHeadendLogSection: React.FC = () => {
  const fields: FormField[] = [
    {
      key: 'debug',
      label: 'Debug Trace',
      type: 'text',
      description: 'Debug subsystems to trace (comma separated)',
    },
    {
      key: 'trace',
      label: 'Trace Subsystems',  
      type: 'text',
      description: 'Subsystems to trace in detail',
    },
    {
      key: 'syslog',
      label: 'Syslog Enable',
      type: 'boolean',
      description: 'Enable logging to syslog',
    },
    {
      key: 'enable_syslog',
      label: 'Enable Syslog',
      type: 'boolean', 
      description: 'Enable system logging',
    },
    {
      key: 'filelog',
      label: 'File logging',
      type: 'boolean',
      description: 'Enable logging to file',
    },
    {
      key: 'filelogpath',
      label: 'File log path',
      type: 'text',
      description: 'Path for log files',
    },
    {
      key: 'log_debug',
      label: 'Log debug messages',
      type: 'boolean',
      description: 'Include debug messages in logs',
    },
    {
      key: 'log_info',
      label: 'Log info messages',
      type: 'boolean', 
      description: 'Include info messages in logs',
    },
    {
      key: 'log_error',
      label: 'Log error messages',
      type: 'boolean',
      description: 'Include error messages in logs',
    },
    {
      key: 'log_warning',
      label: 'Log warning messages',
      type: 'boolean',
      description: 'Include warning messages in logs',
    },
  ];

  return (
    <ConfigForm
      title="TVHeadend Log Configuration"
      url="tvhlog/config"  
      fields={fields}
    />
  );
};

export default TVHeadendLogSection;
