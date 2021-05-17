/**
 * @param TState State is the only true source in the ecosystem, represents the current state of your application. Refer the type of current state your context.
 * @param TPayload Payload is a data value to mutation your state context. Refer then type of payload action, payload type is option if your action not have payload.
 */
export type Params<TState, TPayload = undefined> = {
  state: TState;
  payload: TPayload;
};

export type Method<TState, TPayload = undefined> = (
  params: Params<TState, TPayload>
) => TState;

export type Methods<TState, TPayload = any> = {
  [x: string]: Method<TState, TPayload>;
};

export type Service<TState, TPayload = undefined, TReturn = Promise<any>> = (
  params: Params<TState, TPayload>
) => TReturn;

export type Services<TState, TPayload = any> = {
  [x: string]: Service<TState, TPayload>;
};
/**
 * @param  {TState} state Function Observer
 * The observer pattern is a software design pattern in which an object, called the subject, maintains a list of its dependents, called observers, and notifies them automatically of any state changes, usually by calling one of their methods
 */
export type Subscribe<TState> = (state: TState) => void;

/**
 * @param  {inferP} ...args
 * @returns never
 */
type GetParams<T> = T extends (params: Params<any, infer P>) => any
  ? Params<any, P>['payload']
  : never;

/**
 * @param  {GetParams<T>[1]} payload Payload of action is a data value for mutation your state context
 * @returns string
 */
type WithPayload<T> = (
  payload: GetParams<T>
) => { payload: GetParams<T>; type: string };

/**
 * @param  {string}} =>{The type action defines what changes will be made to the state.
 * @returns string
 */
type WithoutPayload = () => { type: string };

type TMutation<TA> = GetParams<TA> extends undefined
  ? WithoutPayload
  : WithPayload<TA>;

export type Mutations<TContext> = {
  [K in Extract<keyof TContext, string>]: TMutation<TContext[K]>;
};

export interface ObjectContext<TState> {
  state: TState;
  methods: Methods<TState>;
  services?: Services<TState>;
}

/**
 * A class that accepts an initial state, an object of methods, and object of services.
 * Methods object is an approach for sync operations.
 * Services object is an approach for async operations.
 *
 *
 * State automatically generate mutations for methods and services.
 *
 *
 * @param  {TObjectContext} objectContext Context is an object that contains all its methods, services and initial state and name your state.
 */
export class State<
  TObjectContext extends ObjectContext<TObjectContext['state']>
  > {
  private objectContext: TObjectContext;
  private subscribers: Array<Subscribe<TObjectContext['state']>>;
  public mutations: Mutations<TObjectContext['methods']> & Mutations<TObjectContext['services']>;

  constructor(objectContext: TObjectContext) {
    this.objectContext = objectContext;
    this.subscribers = [];
    this.mutations = {
      ...this.mutationCreator(objectContext.methods),
      ...this.effectsCreator(objectContext.services)
    };
  }
  /**
   * Return current state
   */
  get state() {
    return this.objectContext.state;
  }

  private mutationCreator(methods: TObjectContext['methods']) {
    const mutations = Object.assign({}, this.mutations) as any;
    for (let method in methods) {
      mutations[method] = payload => this.dispatch(method, payload);
    }
    return mutations as Mutations<TObjectContext['methods']>;
  }

  private effectsCreator(services: TObjectContext['services']) {
    const effects = Object.assign({}, this.mutations) as any;
    for (let service in services) {
      effects[service] = payload =>
        services[service]({ state: this.state, payload });
    }
    return effects as Mutations<TObjectContext['services']>;
  }

  /**
   * @param  {Subscribe<TContext['state']>} fn
   *
   * A method that accepts a function as a parameter.
   * This function is performed every time the state is updated.
   */
  subscribe(fn: Subscribe<TObjectContext['state']>) {
    this.subscribers = [...this.subscribers, fn];

    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== fn);
    };
  }

  private dispatch(type: string, payload: any) {
    const state = this.reduce(this.objectContext.state, { type, payload });

    if (!state) {
      throw new Error('Reducer functions must return a value');
    } else if (typeof state === 'object') {
      this.objectContext.state = state;
    }

    this.subscribers.forEach((fn: (state: TObjectContext['state']) => void) => {
      fn(this.state);
    });
  }

  private reduce(
    state: TObjectContext['state'],
    mutation: { type: string; payload?: any }
  ) {
    const { methods } = this.objectContext;
    if (mutation.type) {
      const reducer = methods[mutation.type];
      const { payload } = mutation;

      const newState = reducer({ state, payload });

      return newState;
    }
    return state;
  }
}
