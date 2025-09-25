import React from 'react';
import ConfigDataGrid, { GridColumn } from '../common/ConfigDataGrid';

const PasswordsSection: React.FC = () => {
  const columns: GridColumn[] = [
    { key: 'enabled', label: 'Enabled', type: 'boolean', width: 120 },
    { key: 'username', label: 'Username', type: 'text', width: 250 },
    { key: 'password', label: 'Password', type: 'text', width: 250 },
    { key: 'auth', label: 'Auth', type: 'text', width: 250 },
    { key: 'authcode', label: 'Authcode', type: 'text', width: 250 },
    { key: 'comment', label: 'Comment', type: 'text', width: 300 },
  ];

  return (
    <ConfigDataGrid
      title="Passwords"
      titleSingular="Password"
      url="passwd/entry"
      columns={columns}
      canAdd={true}
      canEdit={true}
      canDelete={true}
      canMove={false}
    />
  );
};

export default PasswordsSection;
