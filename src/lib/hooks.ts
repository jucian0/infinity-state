import { useState, useEffect } from 'react';
import { State, Context } from './State';

/**
 * @param  {State<TContext>} stateContext
 * @param  {(state:TContext['state'])=>TR} fn?
 * 
 * A hook that accepts a State object as a parameter 
 * to filter out a specific part of the state.
 */
export const useMutation =
    <TContext extends Context<TContext["state"]>, TR>(stateContext: State<TContext>, fn: (state: TContext['state']) => TR) => {

        const [state, setState] = useState<TContext['state']>(stateContext.state)

        useEffect(() => stateContext.subscribe(setState), [])

        return fn(state)
    }