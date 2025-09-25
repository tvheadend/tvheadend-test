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
  TablePagination,
  TableSortLabel,
  Menu,
  Switch,
  Chip,
  Tooltip,
  Collapse,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowUpward as MoveUpIcon,
  ArrowDownward as MoveDownIcon,
  Refresh as RefreshIcon,
  Help as HelpIcon,
  FilterList as FilterIcon,
  ViewColumn as ColumnIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useHelp } from '../../contexts/HelpContext';

export interface GridColumn {
  key: string;
  label: string;
  width?: number;
  type?: 'text' | 'number' | 'boolean' | 'select';
  options?: Array<{key: string | number, val: string}>;
  sortable?: boolean;
  filterable?: boolean;
  hidden?: boolean;
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
  canGroup?: boolean;
  autoRefresh?: boolean;
  autoRefreshInterval?: number; // seconds
  fields?: string[];
  helpPage?: string; // Help page to show when help button is clicked
  pageSize?: number;
  supportsPagination?: boolean;
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
  canGroup = false,
  autoRefresh = false,
  autoRefreshInterval = 30,
  fields,
  helpPage,
  pageSize = 50,
  supportsPagination = true,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [editDialog, setEditDialog] = useState<{open: boolean, item?: any, isNew: boolean}>({
    open: false,
    isNew: false
  });
  const [editData, setEditData] = useState<any>({});
  
  // Advanced grid state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    columns.reduce((acc, col) => ({...acc, [col.key]: !col.hidden}), {})
  );
  const [totalCount, setTotalCount] = useState(0);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(autoRefresh);
  
  // UI state for menus and dialogs
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  
  const { showHelp } = useHelp();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Build parameters like ExtJS interface
      const params = new URLSearchParams({
        sort: sortBy || 'prefix',  
        dir: sortDirection.toUpperCase(),
        groupBy: 'false',
        groupDir: 'ASC',
        start: supportsPagination ? (page * rowsPerPage).toString() : '0',
        limit: supportsPagination ? rowsPerPage.toString() : '999999'
      });

      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(`filter[${key}]`, value);
        }
      });

      // Use POST request with grid parameters like the old UI  
      const response = await fetch(`/api/${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      });
      const result = await response.json();
      setData(result.entries || []);
      setTotalCount(result.totalCount || result.entries?.length || 0);
    } catch (error) {
      console.error(`Failed to load ${title}:`, error);
    } finally {
      setLoading(false);
    }
  }, [url, title, page, rowsPerPage, sortBy, sortDirection, filters, supportsPagination]);

  // Auto-refresh functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefreshEnabled && autoRefreshInterval > 0) {
      interval = setInterval(() => {
        loadData();
      }, autoRefreshInterval * 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefreshEnabled, autoRefreshInterval, loadData]);

  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable && column?.sortable !== undefined) return;
    
    if (sortBy === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnKey);
      setSortDirection('asc');
    }
    setPage(0); // Reset to first page when sorting
  };

  const handleFilter = (columnKey: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [columnKey]: value
    }));
    setPage(0); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({});
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toggleColumn = (columnKey: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  const activeFiltersCount = Object.values(filters).filter(v => v).length;

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
          
          {/* Auto-refresh toggle */}
          {autoRefresh && (
            <FormControlLabel
              control={
                <Switch
                  checked={autoRefreshEnabled}
                  onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                  size="small"
                />
              }
              label="Auto-refresh"
              sx={{ mr: 2 }}
            />
          )}
          
          {/* Filters */}
          <Tooltip title={`Filters ${activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}`}>
            <IconButton 
              onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
              color={activeFiltersCount > 0 ? 'primary' : 'default'}
            >
              <FilterIcon />
              {activeFiltersCount > 0 && (
                <Chip 
                  size="small" 
                  label={activeFiltersCount} 
                  sx={{ position: 'absolute', top: 0, right: 0, minWidth: 16, height: 16 }}
                />
              )}
            </IconButton>
          </Tooltip>
          
          {/* Column visibility */}
          <Tooltip title="Column visibility">
            <IconButton onClick={(e) => setColumnMenuAnchor(e.currentTarget)}>
              <ColumnIcon />
            </IconButton>
          </Tooltip>
          
          <IconButton onClick={loadData}>
            <RefreshIcon />
          </IconButton>
          {helpPage && (
            <IconButton onClick={() => showHelp(helpPage)}>
              <HelpIcon />
            </IconButton>
          )}
          {canAdd && (
            <Button startIcon={<AddIcon />} onClick={handleAdd}>
              Add
            </Button>
          )}
          {canDelete && selectedRows.length > 0 && (
            <Button startIcon={<DeleteIcon />} onClick={handleDelete} color="error">
              Delete ({selectedRows.length})
            </Button>
          )}
        </Toolbar>

        {/* Filter Panel */}
        <Collapse in={filtersExpanded}>
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Typography variant="subtitle2">Filters:</Typography>
              <Button size="small" onClick={clearFilters} disabled={activeFiltersCount === 0}>
                Clear All
              </Button>
            </Box>
            <Box display="flex" flexWrap="wrap" gap={2}>
              {columns.filter(col => col.filterable !== false && visibleColumns[col.key]).map((column) => (
                <TextField
                  key={column.key}
                  size="small"
                  label={`Filter ${column.label}`}
                  value={filters[column.key] || ''}
                  onChange={(e) => handleFilter(column.key, e.target.value)}
                  sx={{ minWidth: 200 }}
                />
              ))}
            </Box>
          </Box>
        </Collapse>

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
                {columns.filter(col => visibleColumns[col.key]).map((column) => (
                  <TableCell key={column.key} style={{ width: column.width }}>
                    {column.sortable !== false ? (
                      <TableSortLabel
                        active={sortBy === column.key}
                        direction={sortBy === column.key ? sortDirection : 'asc'}
                        onClick={() => handleSort(column.key)}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.filter(col => visibleColumns[col.key]).length + 2} align="center">
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
                  {columns.filter(col => visibleColumns[col.key]).map((column) => (
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

        {/* Pagination */}
        {supportsPagination && (
          <TablePagination
            rowsPerPageOptions={[25, 50, 100, 200, { label: 'All', value: -1 }]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Rows per page:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`
            }
          />
        )}
      </Paper>

      {/* Column Visibility Menu */}
      <Menu
        anchorEl={columnMenuAnchor}
        open={Boolean(columnMenuAnchor)}
        onClose={() => setColumnMenuAnchor(null)}
      >
        <Box sx={{ p: 1, minWidth: 200 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Show/Hide Columns</Typography>
          {columns.map((column) => (
            <FormControlLabel
              key={column.key}
              control={
                <Checkbox
                  checked={visibleColumns[column.key]}
                  onChange={() => toggleColumn(column.key)}
                  size="small"
                />
              }
              label={column.label}
              sx={{ display: 'block', mb: 0.5 }}
            />
          ))}
        </Box>
      </Menu>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
      >
        <Box sx={{ p: 2, minWidth: 300 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle2">Filters</Typography>
            <Button size="small" onClick={clearFilters} disabled={activeFiltersCount === 0}>
              Clear All
            </Button>
          </Box>
          <Button
            fullWidth
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            endIcon={filtersExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ mb: 1 }}
          >
            {filtersExpanded ? 'Hide' : 'Show'} Filter Panel
          </Button>
          <Box>
            {columns.filter(col => col.filterable !== false && visibleColumns[col.key]).slice(0, 3).map((column) => (
              <TextField
                key={column.key}
                fullWidth
                size="small"
                label={`Filter ${column.label}`}
                value={filters[column.key] || ''}
                onChange={(e) => handleFilter(column.key, e.target.value)}
                sx={{ mb: 1 }}
              />
            ))}
          </Box>
        </Box>
      </Menu>

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
          {columns.filter(col => visibleColumns[col.key]).map((column) => (
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
