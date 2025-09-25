import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Toolbar,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowUpward as MoveUpIcon,
  ArrowDownward as MoveDownIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

export interface GridColumn {
  key: string;
  label: string;
  width?: number;
  type?: 'text' | 'number' | 'boolean' | 'select';
  options?: Array<{key: string | number, val: string}>;
}

export interface ConfigDataGridProps {
  title: string;
  titleSingular: string;
  url: string;
  columns: GridColumn[];
  canAdd?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canMove?: boolean;
  fields?: string[];
}

const ConfigDataGrid: React.FC<ConfigDataGridProps> = ({
  title,
  titleSingular,
  url,
  columns,
  canAdd = true,
  canEdit = true,
  canDelete = true,
  canMove = false,
  fields,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [editDialog, setEditDialog] = useState<{open: boolean, item?: any, isNew: boolean}>({
    open: false,
    isNew: false
  });
  const [editData, setEditData] = useState<any>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Use POST request with grid parameters like the old UI
      const response = await fetch(`/api/${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          sort: 'prefix',
          dir: 'ASC',
          groupBy: 'false',
          groupDir: 'ASC',
          start: '0',
          limit: '999999'
        })
      });
      const result = await response.json();
      setData(result.entries || []);
    } catch (error) {
      console.error(`Failed to load ${title}:`, error);
    } finally {
      setLoading(false);
    }
  }, [url, title]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAdd = () => {
    setEditData({});
    setEditDialog({ open: true, isNew: true });
  };

  const handleEdit = (item: any) => {
    setEditData({ ...item });
    setEditDialog({ open: true, item, isNew: false });
  };

  const handleDelete = async () => {
    if (selectedRows.length === 0) return;
    
    try {
      for (const uuid of selectedRows) {
        await fetch('/api/idnode/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uuid }),
        });
      }
      setSelectedRows([]);
      loadData();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleSave = async () => {
    try {
      const apiUrl = editDialog.isNew ? `/api/${url}` : '/api/idnode/save';
      const method = 'POST';
      const body = editDialog.isNew 
        ? { ...editData }
        : { node: editData };

      await fetch(apiUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      setEditDialog({ open: false, isNew: false });
      loadData();
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleMove = async (uuid: string, direction: 'up' | 'down') => {
    try {
      await fetch('/api/idnode/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid, dir: direction === 'up' ? -1 : 1 }),
      });
      loadData();
    } catch (error) {
      console.error('Move failed:', error);
    }
  };

  const renderEditField = (column: GridColumn) => {
    const value = editData[column.key] || '';
    
    switch (column.type) {
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={!!value}
                onChange={(e) => setEditData({...editData, [column.key]: e.target.checked})}
              />
            }
            label={column.label}
          />
        );
      
      case 'select':
        return (
          <FormControl fullWidth margin="normal">
            <InputLabel>{column.label}</InputLabel>
            <Select
              value={value}
              onChange={(e) => setEditData({...editData, [column.key]: e.target.value})}
              label={column.label}
            >
              {column.options?.map((option) => (
                <MenuItem key={option.key} value={option.key}>
                  {option.val}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      
      case 'number':
        return (
          <TextField
            fullWidth
            margin="normal"
            label={column.label}
            type="number"
            value={value}
            onChange={(e) => setEditData({...editData, [column.key]: e.target.value})}
          />
        );
      
      default:
        return (
          <TextField
            fullWidth
            margin="normal"
            label={column.label}
            value={value}
            onChange={(e) => setEditData({...editData, [column.key]: e.target.value})}
          />
        );
    }
  };

  return (
    <Box>
      <Paper>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <IconButton onClick={loadData}>
            <RefreshIcon />
          </IconButton>
          {canAdd && (
            <Button startIcon={<AddIcon />} onClick={handleAdd}>
              Add
            </Button>
          )}
          {canDelete && selectedRows.length > 0 && (
            <Button startIcon={<DeleteIcon />} onClick={handleDelete} color="error">
              Delete
            </Button>
          )}
        </Toolbar>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
                    checked={data.length > 0 && selectedRows.length === data.length}
                    onChange={(e) => {
                      setSelectedRows(e.target.checked ? data.map(item => item.uuid) : []);
                    }}
                  />
                </TableCell>
                {columns.map((column) => (
                  <TableCell key={column.key} style={{ width: column.width }}>
                    {column.label}
                  </TableCell>
                ))}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : data.map((row, index) => (
                <TableRow key={row.uuid || index}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedRows.includes(row.uuid)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows([...selectedRows, row.uuid]);
                        } else {
                          setSelectedRows(selectedRows.filter(id => id !== row.uuid));
                        }
                      }}
                    />
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.type === 'boolean' 
                        ? (row[column.key] ? 'Yes' : 'No')
                        : row[column.key]?.toString() || ''
                      }
                    </TableCell>
                  ))}
                  <TableCell>
                    <Box display="flex" gap={0.5}>
                      {canEdit && (
                        <IconButton size="small" onClick={() => handleEdit(row)}>
                          <EditIcon />
                        </IconButton>
                      )}
                      {canMove && (
                        <>
                          <IconButton 
                            size="small" 
                            onClick={() => handleMove(row.uuid, 'up')}
                            disabled={index === 0}
                          >
                            <MoveUpIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleMove(row.uuid, 'down')}
                            disabled={index === data.length - 1}
                          >
                            <MoveDownIcon />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Edit Dialog */}
      <Dialog 
        open={editDialog.open} 
        onClose={() => setEditDialog({ open: false, isNew: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editDialog.isNew ? `Add ${titleSingular}` : `Edit ${titleSingular}`}
        </DialogTitle>
        <DialogContent>
          {columns.map((column) => (
            <Box key={column.key} sx={{ mb: 2 }}>
              {renderEditField(column)}
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, isNew: false })}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConfigDataGrid;
