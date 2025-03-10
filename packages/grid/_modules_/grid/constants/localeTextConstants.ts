import { GridLocaleText } from '../models/api/gridLocaleTextApi';

export const GRID_DEFAULT_LOCALE_TEXT: GridLocaleText = {
  // Root
  noRowsLabel: 'No rows',
  noResultsOverlayLabel: 'No results found.',
  errorOverlayDefaultLabel: 'An error occurred.',

  // Density selector toolbar button text
  toolbarDensity: 'Density',
  toolbarDensityLabel: 'Density',
  toolbarDensityCompact: 'Compact',
  toolbarDensityStandard: 'Standard',
  toolbarDensityComfortable: 'Comfortable',

  // Columns selector toolbar button text
  toolbarColumns: 'Columns',
  toolbarColumnsLabel: 'Select columns',

  // Filters toolbar button text
  toolbarFilters: 'Filters',
  toolbarFiltersLabel: 'Show filters',
  toolbarFiltersTooltipHide: 'Hide filters',
  toolbarFiltersTooltipShow: 'Show filters',
  toolbarFiltersTooltipActive: (count) =>
    count !== 1 ? `${count} active filters` : `${count} active filter`,

  // Export selector toolbar button text
  toolbarExport: 'Export',
  toolbarExportLabel: 'Export',
  toolbarExportCSV: 'Download as CSV',
  toolbarExportPrint: 'Print',

  // Columns panel text
  columnsPanelTextFieldLabel: 'Find column',
  columnsPanelTextFieldPlaceholder: 'Column title',
  columnsPanelDragIconLabel: 'Reorder column',
  columnsPanelShowAllButton: 'Show all',
  columnsPanelHideAllButton: 'Hide all',

  // Filter panel text
  filterPanelAddFilter: 'Add filter',
  filterPanelDeleteIconLabel: 'Delete',
  filterPanelOperators: 'Operators',
  filterPanelOperatorAnd: 'And',
  filterPanelOperatorOr: 'Or',
  filterPanelColumns: 'Columns',
  filterPanelInputLabel: 'Value',
  filterPanelInputPlaceholder: 'Filter value',

  // Filter operators text
  filterOperatorContains: 'contains',
  filterOperatorEquals: 'equals',
  filterOperatorStartsWith: 'starts with',
  filterOperatorEndsWith: 'ends with',
  filterOperatorIs: 'is',
  filterOperatorNot: 'is not',
  filterOperatorAfter: 'is after',
  filterOperatorOnOrAfter: 'is on or after',
  filterOperatorBefore: 'is before',
  filterOperatorOnOrBefore: 'is on or before',
  filterOperatorIsEmpty: 'is empty',
  filterOperatorIsNotEmpty: 'is not empty',
  filterOperatorIsAnyOf: 'is any of',

  // Filter values text
  filterValueAny: 'any',
  filterValueTrue: 'true',
  filterValueFalse: 'false',

  // Column menu text
  columnMenuLabel: 'Menu',
  columnMenuShowColumns: 'Show columns',
  columnMenuFilter: 'Filter',
  columnMenuHideColumn: 'Hide',
  columnMenuUnsort: 'Unsort',
  columnMenuSortAsc: 'Sort by ASC',
  columnMenuSortDesc: 'Sort by DESC',

  // Column header text
  columnHeaderFiltersTooltipActive: (count) =>
    count !== 1 ? `${count} active filters` : `${count} active filter`,
  columnHeaderFiltersLabel: 'Show filters',
  columnHeaderSortIconLabel: 'Sort',

  // Rows selected footer text
  footerRowSelected: (count) =>
    count !== 1
      ? `${count.toLocaleString()} rows selected`
      : `${count.toLocaleString()} row selected`,

  // Total rows footer text
  footerTotalRows: 'Total Rows:',

  // Total visible rows footer text
  footerTotalVisibleRows: (visibleCount, totalCount) =>
    `${visibleCount.toLocaleString()} of ${totalCount.toLocaleString()}`,

  // Checkbox selection text
  checkboxSelectionHeaderName: 'Checkbox selection',
  checkboxSelectionSelectAllRows: 'Select all rows',
  checkboxSelectionUnselectAllRows: 'Unselect all rows',
  checkboxSelectionSelectRow: 'Select row',
  checkboxSelectionUnselectRow: 'Unselect row',

  // Boolean cell text
  booleanCellTrueLabel: 'true',
  booleanCellFalseLabel: 'false',

  // Actions cell more text
  actionsCellMore: 'more',

  // Column pinning text
  pinToLeft: 'Pin to left',
  pinToRight: 'Pin to right',
  unpin: 'Unpin',

  // Tree Data
  treeDataGroupingHeaderName: 'Group',
  treeDataExpand: 'see children',
  treeDataCollapse: 'hide children',

  // Grouping columns
  groupingColumnHeaderName: 'Group',
  groupColumn: (name) => `Group by ${name}`,
  unGroupColumn: (name) => `Stop grouping by ${name}`,

  // Master/detail
  expandDetailPanel: 'Expand',
  collapseDetailPanel: 'Collapse',

  // Used core components translation keys
  MuiTablePagination: {},
};
