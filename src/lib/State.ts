/**
 * @param  {TState} state
 * @param  {TPayload} payload
 */
export type Method<TState, TPayload = undefined> = (state: TState, payload: TPayload) => TState

type Methods<TState, TPayload = any> =
    { [x: string]: Method<TState, TPayload>; }

/**
* @param  {TState} state
* @param  {TPayload} payload
*/
export type Service<TState, TPayload = undefined> = (state: TState, payload: TPayload) => Promise<any>

type Services<TState, TPayload = any> =
    { [x: string]: Service<TState, TPayload>; }

/**
 * @param  {TState} state
 */
export type Subscribe<TState> = (state: TState) => void;

/**
 * @param  {inferP} ...args
 * @returns never
 */
type GetParams<T> = T extends (...args: infer P) => any ? P : never;
/**
 * @param  {GetParams<T>[1]} payload
 * @returns string
 */
type WithPayload<T> = (payload: GetParams<T>[1]) => { payload: GetParams<T>[1], type: string }
/**
 * @param  {string}} =>{type
 * @returns string
 */
type WithoutPayload = () => { type: string }

type TMutation<TA> = GetParams<TA>[1] extends undefined ? WithoutPayload : WithPayload<TA>

export type Mutations<TContext> = {
    [K in Extract<keyof TContext, string>]: TMutation<TContext[K]>
}

export interface Context<TState> {
    state: TState;
    methods: Methods<TState>;
    services?: Services<TState>;
}

/**
 * @param  {TContext} context
 */
export class State<TContext extends Context<TContext['state']>>{

    public context: TContext;
    private subscribers: Array<Subscribe<TContext["state"]>>;
    public mutations: Mutations<TContext["methods"]> &
        Mutations<TContext["services"]>

    constructor(context: TContext) {
        this.context = context
        this.subscribers = []
        this.mutations = this.actionCreator(context.methods, context.services)
    }
    /**
     * Return current state
     */
    get state() {
        return this.context.state
    }

    private actionCreator(methods: TContext["methods"], services?: TContext["services"]) {
        let mutations = Object.assign({}, this.mutations) as any
        for (let method in { ...methods, ...services }) {
            mutations[method] = (payload: any) => this.dispatch(method, payload)
        }
        return mutations as Mutations<TContext["methods"]> & Mutations<TContext["services"]>
    }
    /**
     * @param  {Subscribe<TContext['state']>} fn
     * 
     * A method that accepts a function as a parameter.
     * This function is performed every time the state is updated.
     */
    subscribe(fn: Subscribe<TContext['state']>) {

        this.subscribers = [...this.subscribers, fn]

        return () => {
            this.subscribers = this.subscribers.filter(sub => sub !== fn)
        }
    }

    private dispatch(type: string, payload: any) {

        const state = this.reduce(this.context.state, { type, payload })
        if (!state) {
            throw new Error('Reducer and SideEffect functions must return a value')
        } else if (typeof state === 'object') {
            this.context.state = state
        }

        this.subscribers.forEach((fn: (state: TContext["state"]) => void) => {
            fn(this.state)
        });
    }

    private reduce(state: TContext["state"], mutation: { type: string; payload?: any; }) {

        const handlers = Object.assign(this.context.methods, this.context.services)
        if (mutation.type) {

            const reducer = handlers[mutation.type]

            const newState: any = reducer(
                state,
                mutation.payload
            )

            if (
                typeof newState.then === 'function' ||
                typeof newState.catch === 'function'
            ) {
                return state
            }

            return newState
        }
        return state
    }

}