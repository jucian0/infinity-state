import { useState, useEffect } from 'react';

export const useMutation = <TContext extends any, TR>(
  stateContext: TContext,
  fn: (state: TContext['state']) => TR
) => {
  const [state, setState] = useState<TContext['state']>(stateContext.state);

  useEffect(() => stateContext.subscribe(setState), []);

  return fn(state);
};
