import * as React from 'react';
import { useThemeProps } from '@mui/material/styles';
import {
  DataGridProcessedProps,
  DataGridProps,
  DataGridForcedPropsKey,
  DataGridPropsWithDefaultValues,
} from '../../_modules_/grid/models/props/DataGridProps';

import { DATA_GRID_DEFAULT_SLOTS_COMPONENTS } from '../../_modules_/grid/constants/defaultGridSlotsComponents';
import {
  GRID_DEFAULT_LOCALE_TEXT,
  GridDensityTypes,
  GridEditModes,
  GridFeatureModeConstant,
  GridSlotsComponent,
} from '../../_modules_';

const DATA_GRID_FORCED_PROPS: { [key in DataGridForcedPropsKey]?: DataGridProcessedProps[key] } = {
  apiRef: undefined,
  disableMultipleColumnsFiltering: true,
  disableMultipleColumnsSorting: true,
  disableMultipleSelection: true,
  throttleRowsMs: undefined,
  hideFooterRowCount: false,
  pagination: true,
  checkboxSelectionVisibleOnly: false,
  disableColumnReorder: true,
  disableColumnResize: true,
  signature: 'DataGrid',
};

export const MAX_PAGE_SIZE = 100;

/**
 * The default values of `DataGridPropsWithDefaultValues` to inject in the props of DataGrid.
 */
export const DATA_GRID_PROPS_DEFAULT_VALUES: DataGridPropsWithDefaultValues = {
  autoHeight: false,
  autoPageSize: false,
  checkboxSelection: false,
  checkboxSelectionVisibleOnly: false,
  columnBuffer: 3,
  rowBuffer: 3,
  columnThreshold: 3,
  rowThreshold: 3,
  density: GridDensityTypes.Standard,
  disableExtendRowFullWidth: false,
  disableColumnFilter: false,
  disableColumnMenu: false,
  disableColumnSelector: false,
  disableDensitySelector: false,
  disableMultipleColumnsFiltering: false,
  disableMultipleSelection: false,
  disableMultipleColumnsSorting: false,
  disableSelectionOnClick: false,
  disableVirtualization: false,
  editMode: GridEditModes.Cell,
  filterMode: GridFeatureModeConstant.client,
  headerHeight: 56,
  hideFooter: false,
  hideFooterPagination: false,
  hideFooterRowCount: false,
  hideFooterSelectedRowCount: false,
  logger: console,
  logLevel: process.env.NODE_ENV === 'production' ? ('error' as const) : ('warn' as const),
  pagination: false,
  paginationMode: GridFeatureModeConstant.client,
  rowHeight: 52,
  rowsPerPageOptions: [25, 50, 100],
  showCellRightBorder: false,
  showColumnRightBorder: false,
  sortingOrder: ['asc' as const, 'desc' as const, null],
  sortingMode: GridFeatureModeConstant.client,
  throttleRowsMs: 0,
  disableColumnReorder: false,
  disableColumnResize: false,
};

export const useDataGridProps = (inProps: DataGridProps) => {
  if (inProps.pageSize! > MAX_PAGE_SIZE) {
    throw new Error(`'props.pageSize' cannot exceed 100 in DataGrid.`);
  }

  const themedProps = useThemeProps({ props: inProps, name: 'MuiDataGrid' });

  const localeText = React.useMemo(
    () => ({ ...GRID_DEFAULT_LOCALE_TEXT, ...themedProps.localeText }),
    [themedProps.localeText],
  );

  const components = React.useMemo<GridSlotsComponent>(() => {
    const overrides = themedProps.components;

    if (!overrides) {
      return { ...DATA_GRID_DEFAULT_SLOTS_COMPONENTS };
    }

    const mergedComponents = {} as GridSlotsComponent;

    Object.keys(DATA_GRID_DEFAULT_SLOTS_COMPONENTS).forEach((key) => {
      mergedComponents[key] =
        overrides[key] === undefined ? DATA_GRID_DEFAULT_SLOTS_COMPONENTS[key] : overrides[key];
    });

    return mergedComponents;
  }, [themedProps.components]);

  return React.useMemo<DataGridProcessedProps>(
    () => ({
      ...DATA_GRID_PROPS_DEFAULT_VALUES,
      ...themedProps,
      localeText,
      components,
      ...DATA_GRID_FORCED_PROPS,
    }),
    [themedProps, localeText, components],
  );
};
