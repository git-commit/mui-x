import * as React from 'react';
import MuiDivider from '@mui/material/Divider';
import {
  MuiEvent,
  GridRowParams,
  useGridSelector,
  visibleGridColumnsSelector,
  gridColumnsMetaSelector,
  gridVisibleColumnFieldsSelector,
  gridClasses,
  GridEvents,
  useGridApiMethod,
  useGridApiEventHandler,
  unstable_useGridRegisterPreProcessor as useGridRegisterPreProcessor,
  unstable_useGridStateInit as useGridStateInit,
  Unstable_GridPreProcessor as GridPreProcessor,
  Unstable_GridRestoreStatePreProcessingContext as GridRestoreStatePreProcessingContext,
} from '@mui/x-data-grid';
import { GridApiPro } from '../../../models/gridApiPro';
import { GridInitialStatePro, GridStatePro } from '../../../models/gridStatePro';
import { DataGridProProcessedProps } from '../../../models/dataGridProProps';
import { GridColumnPinningMenuItems } from '../../../components/GridColumnPinningMenuItems';
import {
  GridColumnPinningApi,
  GridPinnedPosition,
  GridPinnedColumns,
} from './gridColumnPinningInterface';
import { gridPinnedColumnsSelector } from './gridColumnPinningSelector';
import { filterColumns } from '../../../components/DataGridProVirtualScroller';

const Divider = () => <MuiDivider onClick={(event) => event.stopPropagation()} />;

const mergeStateWithPinnedColumns =
  (pinnedColumns: GridPinnedColumns) =>
  (state: GridStatePro): GridStatePro => ({ ...state, pinnedColumns });

export const useGridColumnPinning = (
  apiRef: React.MutableRefObject<GridApiPro>,
  props: Pick<
    DataGridProProcessedProps,
    'initialState' | 'disableColumnPinning' | 'pinnedColumns' | 'onPinnedColumnsChange'
  >,
): void => {
  useGridStateInit(apiRef, (state) => {
    let model: GridPinnedColumns;
    if (props.disableColumnPinning) {
      model = {};
    } else if (props.pinnedColumns) {
      model = props.pinnedColumns;
    } else if (props.initialState?.pinnedColumns) {
      model = props.initialState?.pinnedColumns;
    } else {
      model = {};
    }

    return {
      ...state,
      pinnedColumns: model,
    };
  });
  const pinnedColumns = useGridSelector(apiRef, gridPinnedColumnsSelector);

  // Each visible row (not to be confused with a filter result) is composed of a central .MuiDataGrid-row element
  // and up to two additional .MuiDataGrid-row's, one for the columns pinned to the left and another
  // for those on the right side. When hovering any of these elements, the :hover styles are applied only to
  // the row element that was actually hovered, not its additional siblings. To make it look like a contiguous row,
  // this method adds/removes the .Mui-hovered class to all of the row elements inside one visible row.
  const updateHoveredClassOnSiblingRows = React.useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (props.disableColumnPinning) {
        return;
      }

      if (!Array.isArray(pinnedColumns.left) && !Array.isArray(pinnedColumns.right)) {
        return;
      }

      const nbLeftPinnedColumns = pinnedColumns.left?.length ?? 0;
      const nbRightPinnedColumns = pinnedColumns.right?.length ?? 0;
      if (nbLeftPinnedColumns + nbRightPinnedColumns === 0) {
        return;
      }

      const index = event.currentTarget.dataset.rowindex;
      const rowElements = apiRef.current.windowRef!.current!.querySelectorAll(
        `.${gridClasses.row}[data-rowindex="${index}"]`,
      );
      rowElements.forEach((row) => {
        // Ignore rows from other grid inside the hovered row
        if (row.closest(`.${gridClasses.virtualScroller}`) === apiRef.current.windowRef!.current!) {
          if (event.type === 'mouseenter') {
            row.classList.add('Mui-hovered');
          } else {
            row.classList.remove('Mui-hovered');
          }
        }
      });
    },
    [apiRef, pinnedColumns.left, pinnedColumns.right, props.disableColumnPinning],
  );

  const handleMouseEnter = React.useCallback(
    (params: GridRowParams, event: MuiEvent<React.MouseEvent<HTMLElement>>) => {
      updateHoveredClassOnSiblingRows(event);
    },
    [updateHoveredClassOnSiblingRows],
  );

  const handleMouseLeave = React.useCallback(
    (params: GridRowParams, event: MuiEvent<React.MouseEvent<HTMLElement>>) => {
      updateHoveredClassOnSiblingRows(event);
    },
    [updateHoveredClassOnSiblingRows],
  );

  useGridApiEventHandler(apiRef, GridEvents.rowMouseEnter, handleMouseEnter);
  useGridApiEventHandler(apiRef, GridEvents.rowMouseLeave, handleMouseLeave);

  /**
   * PRE-PROCESSING
   */
  const calculateScrollLeft = React.useCallback<GridPreProcessor<'scrollToIndexes'>>(
    (initialValue, params) => {
      if (props.disableColumnPinning) {
        return initialValue;
      }

      const visibleColumnFields = gridVisibleColumnFieldsSelector(apiRef);
      const [leftPinnedColumns, rightPinnedColumns] = filterColumns(
        pinnedColumns,
        visibleColumnFields,
      );

      if (!params.colIndex || (leftPinnedColumns.length === 0 && rightPinnedColumns.length === 0)) {
        return initialValue;
      }

      const visibleColumns = visibleGridColumnsSelector(apiRef);
      const columnsMeta = gridColumnsMetaSelector(apiRef);
      const clientWidth = apiRef.current.windowRef!.current!.clientWidth;
      const scrollLeft = apiRef.current.windowRef!.current!.scrollLeft;
      const offsetWidth = visibleColumns[params.colIndex].computedWidth;
      const offsetLeft = columnsMeta.positions[params.colIndex];

      const leftPinnedColumnsWidth = columnsMeta.positions[leftPinnedColumns.length];
      const rightPinnedColumnsWidth =
        columnsMeta.totalWidth -
        columnsMeta.positions[columnsMeta.positions.length - rightPinnedColumns.length];

      const elementBottom = offsetLeft + offsetWidth;
      if (elementBottom - (clientWidth - rightPinnedColumnsWidth) > scrollLeft) {
        const left = elementBottom - (clientWidth - rightPinnedColumnsWidth);
        return { ...initialValue, left };
      }
      if (offsetLeft < scrollLeft + leftPinnedColumnsWidth) {
        const left = offsetLeft - leftPinnedColumnsWidth;
        return { ...initialValue, left };
      }
      return initialValue;
    },
    [apiRef, pinnedColumns, props.disableColumnPinning],
  );

  const addColumnMenuButtons = React.useCallback<GridPreProcessor<'columnMenu'>>(
    (initialValue, column) => {
      if (props.disableColumnPinning) {
        return initialValue;
      }

      if (column.pinnable === false) {
        return initialValue;
      }

      return [...initialValue, <Divider />, <GridColumnPinningMenuItems />];
    },
    [props.disableColumnPinning],
  );

  const reorderPinnedColumns = React.useCallback<GridPreProcessor<'hydrateColumns'>>(
    (columnsState) => {
      if (columnsState.all.length === 0 || props.disableColumnPinning) {
        return columnsState;
      }

      const [leftPinnedColumns, rightPinnedColumns] = filterColumns(
        pinnedColumns,
        columnsState.all,
      );

      if (leftPinnedColumns.length === 0 && rightPinnedColumns.length === 0) {
        return columnsState;
      }

      const centerColumns = columnsState.all.filter((field) => {
        return !leftPinnedColumns.includes(field) && !rightPinnedColumns.includes(field);
      });

      return {
        ...columnsState,
        all: [...leftPinnedColumns, ...centerColumns, ...rightPinnedColumns],
      };
    },
    [pinnedColumns, props.disableColumnPinning],
  );

  const checkIfCanBeReordered = React.useCallback<GridPreProcessor<'canBeReordered'>>(
    (initialValue, { targetIndex }) => {
      const visibleColumnFields = gridVisibleColumnFieldsSelector(apiRef);
      const [leftPinnedColumns, rightPinnedColumns] = filterColumns(
        pinnedColumns,
        visibleColumnFields,
      );

      if (leftPinnedColumns.length === 0 && rightPinnedColumns.length === 0) {
        return initialValue;
      }

      if (leftPinnedColumns.length > 0 && targetIndex < leftPinnedColumns.length) {
        return false;
      }

      if (rightPinnedColumns.length > 0) {
        const visibleColumns = visibleGridColumnsSelector(apiRef);
        const firstRightPinnedColumnIndex = visibleColumns.length - rightPinnedColumns.length;
        return targetIndex >= firstRightPinnedColumnIndex ? false : initialValue;
      }

      return initialValue;
    },
    [apiRef, pinnedColumns],
  );

  const stateExportPreProcessing = React.useCallback<GridPreProcessor<'exportState'>>(
    (prevState) => {
      const pinnedColumnsToExport = gridPinnedColumnsSelector(apiRef.current.state);
      if (
        (!pinnedColumnsToExport.left || pinnedColumnsToExport.left.length === 0) &&
        (!pinnedColumnsToExport.right || pinnedColumnsToExport.right.length === 0)
      ) {
        return prevState;
      }

      return {
        ...prevState,
        pinnedColumns: pinnedColumnsToExport,
      };
    },
    [apiRef],
  );

  const stateRestorePreProcessing = React.useCallback<GridPreProcessor<'restoreState'>>(
    (params, context: GridRestoreStatePreProcessingContext<GridInitialStatePro>) => {
      const newPinnedColumns = context.stateToRestore.pinnedColumns;
      if (newPinnedColumns != null) {
        apiRef.current.setState(mergeStateWithPinnedColumns(newPinnedColumns));
      }

      return params;
    },
    [apiRef],
  );

  useGridRegisterPreProcessor(apiRef, 'scrollToIndexes', calculateScrollLeft);
  useGridRegisterPreProcessor(apiRef, 'columnMenu', addColumnMenuButtons);
  useGridRegisterPreProcessor(apiRef, 'hydrateColumns', reorderPinnedColumns);
  useGridRegisterPreProcessor(apiRef, 'canBeReordered', checkIfCanBeReordered);
  useGridRegisterPreProcessor(apiRef, 'exportState', stateExportPreProcessing);
  useGridRegisterPreProcessor(apiRef, 'restoreState', stateRestorePreProcessing);

  apiRef.current.unstable_updateControlState({
    stateId: 'pinnedColumns',
    propModel: props.pinnedColumns,
    propOnChange: props.onPinnedColumnsChange,
    stateSelector: gridPinnedColumnsSelector,
    changeEvent: GridEvents.pinnedColumnsChange,
  });

  const checkIfEnabled = React.useCallback(
    (methodName) => {
      if (props.disableColumnPinning) {
        throw new Error(
          `MUI: You cannot call \`apiRef.current.${methodName}\` when \`disableColumnPinning\` is true.`,
        );
      }
    },
    [props.disableColumnPinning],
  );

  const pinColumn = React.useCallback<GridColumnPinningApi['pinColumn']>(
    (field: string, side: GridPinnedPosition) => {
      checkIfEnabled('pinColumn');

      if (apiRef.current.isColumnPinned(field) === side) {
        return;
      }

      apiRef.current.setState((state) => {
        const otherSide =
          side === GridPinnedPosition.right ? GridPinnedPosition.left : GridPinnedPosition.right;
        const newPinnedColumns = {
          ...state.pinnedColumns,
          [side]: [...(state.pinnedColumns[side] || []), field],
          [otherSide]: (state.pinnedColumns[otherSide] || []).filter((column) => column !== field),
        };
        return { ...state, pinnedColumns: newPinnedColumns };
      });
      apiRef.current.forceUpdate();
    },
    [apiRef, checkIfEnabled],
  );

  const unpinColumn = React.useCallback<GridColumnPinningApi['unpinColumn']>(
    (field: string) => {
      checkIfEnabled('unpinColumn');
      apiRef.current.setState((state) => {
        const newPinnedColumns = {
          ...state.pinnedColumns,
          left: (state.pinnedColumns.left || []).filter((column) => column !== field),
          right: (state.pinnedColumns.right || []).filter((column) => column !== field),
        };
        return { ...state, pinnedColumns: newPinnedColumns };
      });
      apiRef.current.forceUpdate();
    },
    [apiRef, checkIfEnabled],
  );

  const getPinnedColumns = React.useCallback<GridColumnPinningApi['getPinnedColumns']>(() => {
    checkIfEnabled('getPinnedColumns');
    return gridPinnedColumnsSelector(apiRef.current.state);
  }, [apiRef, checkIfEnabled]);

  const setPinnedColumns = React.useCallback<GridColumnPinningApi['setPinnedColumns']>(
    (newPinnedColumns) => {
      checkIfEnabled('setPinnedColumns');
      apiRef.current.setState(mergeStateWithPinnedColumns(newPinnedColumns));
      apiRef.current.forceUpdate();
    },
    [apiRef, checkIfEnabled],
  );

  const isColumnPinned = React.useCallback<GridColumnPinningApi['isColumnPinned']>(
    (field) => {
      checkIfEnabled('isColumnPinned');
      const leftPinnedColumns = pinnedColumns.left || [];
      if (leftPinnedColumns.includes(field)) {
        return GridPinnedPosition.left;
      }
      const rightPinnedColumns = pinnedColumns.right || [];
      if (rightPinnedColumns.includes(field)) {
        return GridPinnedPosition.right;
      }
      return false;
    },
    [pinnedColumns.left, pinnedColumns.right, checkIfEnabled],
  );

  const columnPinningApi: GridColumnPinningApi = {
    pinColumn,
    unpinColumn,
    getPinnedColumns,
    setPinnedColumns,
    isColumnPinned,
  };
  useGridApiMethod(apiRef, columnPinningApi, 'columnPinningApi');

  React.useEffect(() => {
    if (props.pinnedColumns) {
      apiRef.current.setPinnedColumns(props.pinnedColumns);
    }
  }, [apiRef, props.pinnedColumns]);
};
