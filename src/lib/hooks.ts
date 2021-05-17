import { useState, useEffect } from 'react';
import { State } from './state';


/**
 * @param  {TContext} stateContext StateContext.
 * @param  {(state:TContext['state'])=>TR} fn Function callback to change state value.
 */
export const useContextState = <TContext extends State<any>, TR>(
  stateContext: TContext,
  fn: (state: TContext['state']) => TR
) => {
  const [state, setState] = useState<TContext['state']>(stateContext.state);

  useEffect(() => stateContext.subscribe(setState), []);

  return fn(state);
};


/**
 * @param  {TContext} stateContext StateContext.
 * @param  {(state:TContext['state'])=>TR} fn Function callback to change state value.
 */
 export const useContext = <TContext extends State<any>, TR>(
  stateContext: TContext ,
  fn: (state: TContext['state']) => TR
):[TContext['state'], TContext['mutations']] => {
  const [state, setState] = useState<TContext['state']>(stateContext.state);

  useEffect(() => stateContext.subscribe(setState), []);

  return [fn(state), stateContext.mutations];
};