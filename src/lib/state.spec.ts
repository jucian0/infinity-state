import test from 'ava';
import { isObject, isFunction } from 'util';
import { Params, State } from '..';
import { Services, Methods } from './state';

const methods= {
  add: ({ state, payload }: Params<number, number>) => state + payload,
  remove: ({ state, payload }: Params<number, number>) => state - payload
};

const services = {
  addAsync: ({ state, payload }: Params<number, number>) =>
    Promise.resolve(state + payload).then(resp => context.mutations.add(resp)),
  removeAsync: ({ state, payload }: Params<number, number>) =>
    Promise.resolve(state + payload).then(resp => context.mutations.remove(resp))
};

const context = new State({
  state: 0,
  methods,
  services
});

context.mutations.addAsync()


test('must create actions and effects', t => {
  const methodsKeys = Object.keys({ ...methods, ...services });
  const actionsKeys = Object.keys(actions);

  t.deepEqual(methodsKeys, actionsKeys);
});

test('must actions return object type', t => {
  for (const key in methods) {
    t.is(isObject(actions[key](1)), true)
  }
});

test('must effects return object type with a effect function', t => {
  for (const key in services) {
    t.is(isObject(actions[key](1)), true)
    t.is(isFunction(actions[key](1).effect), true)
  }
});

test('must return a reducer function', t => {
  const result = reducer(10, actions.add(1))
  t.is(result, 11)

})

test('must return state when pass invalid action', t => {
  const result = reducer(10, { type: 'invalid', payload: 20 })
  t.is(result, 10)
})


