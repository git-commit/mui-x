import * as React from 'react';
import { useFirstRender } from '../../utils/useFirstRender';
import { GridApiCommon } from '../../../models/api/gridApiCommon';
import { GridPreProcessingGroup, PreProcessorCallback } from './gridPreProcessingApi';

export const useGridRegisterPreProcessor = <Api extends GridApiCommon>(
  apiRef: React.MutableRefObject<Api>,
  group: GridPreProcessingGroup,
  callback: PreProcessorCallback,
) => {
  const cleanup = React.useRef<(() => void) | null>();
  const id = React.useRef(`mui-${Math.round(Math.random() * 1e9)}`);

  const registerPreProcessor = React.useCallback(() => {
    cleanup.current = apiRef.current.unstable_registerPreProcessor(group, id.current, callback);
  }, [apiRef, callback, group]);

  useFirstRender(() => {
    registerPreProcessor();
  });

  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      registerPreProcessor();
    }

    return () => {
      if (cleanup.current) {
        cleanup.current();
        cleanup.current = null;
      }
    };
  }, [registerPreProcessor]);
};
