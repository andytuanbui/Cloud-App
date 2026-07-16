import { DependencyList, useEffect, useState } from 'react';

export type AsyncResourceState<T> = {
  data: T | null;
  error: Error | null;
  loading: boolean;
};

export function useAsyncResource<T>(load: () => Promise<T>, dependencies: DependencyList): AsyncResourceState<T> {
  const [state, setState] = useState<AsyncResourceState<T>>({
    data: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;

    setState((current) => ({
      data: current.data,
      error: null,
      loading: true,
    }));

    load()
      .then((data) => {
        if (isMounted) {
          setState({ data, error: null, loading: false });
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setState({
            data: null,
            error: error instanceof Error ? error : new Error('Unknown async resource error'),
            loading: false,
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return state;
}
