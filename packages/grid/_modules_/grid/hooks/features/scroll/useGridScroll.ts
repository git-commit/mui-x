import * as React from 'react';
import { GridCellIndexCoordinates } from '../../../models/gridCell';
import { GridApiCommunity } from '../../../models/api/gridApiCommunity';
import { useGridLogger } from '../../utils/useGridLogger';
import {
  gridColumnsMetaSelector,
  visibleGridColumnsSelector,
} from '../columns/gridColumnsSelector';
import { useGridSelector } from '../../utils/useGridSelector';
import { DataGridProcessedProps } from '../../../models/props/DataGridProps';
import { gridPaginationSelector } from '../pagination/gridPaginationSelector';
import { gridRowCountSelector } from '../rows/gridRowsSelector';
import { gridRowsMetaSelector } from '../rows/gridRowsMetaSelector';
import { GridScrollParams } from '../../../models/params/gridScrollParams';
import { GridScrollApi } from '../../../models/api/gridScrollApi';
import { useGridApiMethod } from '../../utils/useGridApiMethod';
import { useGridNativeEventListener } from '../../utils/useGridNativeEventListener';

// Logic copied from https://www.w3.org/TR/wai-aria-practices/examples/listbox/js/listbox.js
// Similar to https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
function scrollIntoView(dimensions) {
  const { clientHeight, scrollTop, offsetHeight, offsetTop } = dimensions;

  const elementBottom = offsetTop + offsetHeight;
  if (elementBottom - clientHeight > scrollTop) {
    return elementBottom - clientHeight;
  }
  if (offsetTop < scrollTop) {
    return offsetTop;
  }
  return undefined;
}

/**
 * @requires useGridPage (state)
 * @requires useGridPageSize (state)
 * @requires useGridColumns (state)
 * @requires useGridRows (state)
 * @requires useGridDensity (state)
 */
export const useGridScroll = (
  apiRef: React.MutableRefObject<GridApiCommunity>,
  props: Pick<DataGridProcessedProps, 'pagination'>,
): void => {
  const logger = useGridLogger(apiRef, 'useGridScroll');
  const colRef = apiRef.current.columnHeadersElementRef!;
  const windowRef = apiRef.current.windowRef!;

  const paginationState = useGridSelector(apiRef, gridPaginationSelector);
  const totalRowCount = useGridSelector(apiRef, gridRowCountSelector);
  const visibleColumns = useGridSelector(apiRef, visibleGridColumnsSelector);
  const columnsMeta = useGridSelector(apiRef, gridColumnsMetaSelector);
  const rowsMeta = useGridSelector(apiRef, gridRowsMetaSelector);

  const scrollToIndexes = React.useCallback<GridScrollApi['scrollToIndexes']>(
    (params: Partial<GridCellIndexCoordinates>) => {
      if (totalRowCount === 0 || visibleColumns.length === 0) {
        return false;
      }

      logger.debug(`Scrolling to cell at row ${params.rowIndex}, col: ${params.colIndex} `);

      let scrollCoordinates: Partial<GridScrollParams> = {};

      if (params.colIndex != null) {
        scrollCoordinates.left = scrollIntoView({
          clientHeight: windowRef.current!.clientWidth,
          scrollTop: windowRef.current!.scrollLeft,
          offsetHeight: visibleColumns[params.colIndex].computedWidth,
          offsetTop: columnsMeta.positions[params.colIndex],
        });
      }
      if (params.rowIndex != null) {
        const elementIndex = !props.pagination
          ? params.rowIndex
          : params.rowIndex - paginationState.page * paginationState.pageSize;

        const targetOffseHeight = rowsMeta.positions[elementIndex + 1]
          ? rowsMeta.positions[elementIndex + 1] - rowsMeta.positions[elementIndex]
          : rowsMeta.currentPageTotalHeight - rowsMeta.positions[elementIndex];

        scrollCoordinates.top = scrollIntoView({
          clientHeight: windowRef.current!.clientHeight,
          scrollTop: windowRef.current!.scrollTop,
          offsetHeight: targetOffseHeight,
          offsetTop: rowsMeta.positions[elementIndex],
        });
      }

      scrollCoordinates = apiRef.current.unstable_applyPreProcessors(
        'scrollToIndexes',
        scrollCoordinates,
        params,
      );

      if (
        typeof scrollCoordinates.left !== undefined ||
        typeof scrollCoordinates.top !== undefined
      ) {
        apiRef.current.scroll(scrollCoordinates);
        return true;
      }

      return false;
    },
    [
      totalRowCount,
      visibleColumns,
      logger,
      apiRef,
      windowRef,
      columnsMeta.positions,
      props.pagination,
      paginationState.page,
      paginationState.pageSize,
      rowsMeta.positions,
      rowsMeta.currentPageTotalHeight,
    ],
  );

  const scroll = React.useCallback<GridScrollApi['scroll']>(
    (params: Partial<GridScrollParams>) => {
      if (windowRef.current && params.left != null && colRef.current) {
        colRef.current.scrollLeft = params.left;
        windowRef.current.scrollLeft = params.left;
        logger.debug(`Scrolling left: ${params.left}`);
      }
      if (windowRef.current && params.top != null) {
        windowRef.current.scrollTop = params.top;
        logger.debug(`Scrolling top: ${params.top}`);
      }
      logger.debug(`Scrolling, updating container, and viewport`);
    },
    [windowRef, colRef, logger],
  );

  const getScrollPosition = React.useCallback<GridScrollApi['getScrollPosition']>(() => {
    if (!windowRef?.current) {
      return { top: 0, left: 0 };
    }
    return { top: windowRef.current.scrollTop, left: windowRef.current.scrollLeft };
  }, [windowRef]);

  const scrollApi: GridScrollApi = {
    scroll,
    scrollToIndexes,
    getScrollPosition,
  };
  useGridApiMethod(apiRef, scrollApi, 'GridScrollApi');

  const preventScroll = React.useCallback((event: any) => {
    event.target.scrollLeft = 0;
    event.target.scrollTop = 0;
  }, []);

  useGridNativeEventListener(
    apiRef,
    () => apiRef.current?.renderingZoneRef?.current?.parentElement,
    'scroll',
    preventScroll,
  );
};
