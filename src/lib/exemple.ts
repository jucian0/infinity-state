import { State, Params } from './state';

const { mutations } = new State({
  state: 0,
  methods: {
    add: ({ state, payload }: Params<number, number>) => state + payload,
    remove: ({ state, payload }: Params<number, number>) => state + payload,
    not: ({ state }: Params<number>) => state,
    opString: ({ state }: Params<number, string>) => state
  },
  services: {
    assync: ({ state, payload }: Params<number, number>) =>
      Promise.resolve(state + payload)
  }
});

mutations.add(1);
mutations.remove(2);
mutations.not();
mutations.opString('');
mutations.assync(2);
