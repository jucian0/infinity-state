import { useState, useEffect } from 'react';

/**
 * @param  {TContext} stateContext StateContext.
 * @param  {(state:TContext['state'])=>TR} fn Function callback to change state value.
 */
export const useIState = <TContext extends any, TR>(
  stateContext: TContext,
  fn: (state: TContext['state']) => TR
) => {
  const [state, setState] = useState<TContext['state']>(stateContext.state);

  useEffect(() => stateContext.subscribe(setState), []);

  return fn(state);
};
