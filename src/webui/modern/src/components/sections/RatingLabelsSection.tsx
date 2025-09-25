import React from 'react';
import ConfigDataGrid, { GridColumn } from '../common/ConfigDataGrid';

const RatingLabelsSection: React.FC = () => {
  const columns: GridColumn[] = [
    { key: 'enabled', label: 'Enabled', type: 'boolean', width: 120 },
    { key: 'identifier', label: 'Identifier', type: 'text', width: 150 },
    { key: 'display_name', label: 'Display Name', type: 'text', width: 200 },
    { key: 'age', label: 'Age', type: 'number', width: 100 },
    { key: 'icon', label: 'Icon', type: 'text', width: 300 },
    { key: 'comment', label: 'Comment', type: 'text', width: 300 },
  ];

  return (
    <ConfigDataGrid
      title="Rating Labels"
      titleSingular="Rating Label"
      url="ratinglabel"
      columns={columns}
      canAdd={true}
      canEdit={true}
      canDelete={true}
      canMove={false}
    />
  );
};

export default RatingLabelsSection;
