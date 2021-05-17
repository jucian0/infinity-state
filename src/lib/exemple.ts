import { useIState } from './hooks';
import { State, Params } from './state';

const context = new State({
  state: 0,
  methods: {
    add: ({ state, payload }: Params<number, number>) => state + payload,
    remove: ({ state, payload }: Params<number, number>) => state + payload,
    not: ({ state }: Params<number>) => state,
    opString: ({ state }: Params<number, string>) => state
  },
  services: {
    async: ({ state, payload }: Params<number, number>) =>
      Promise.resolve(state + payload)
  }
});

const {mutations} = context

mutations.add(1);
mutations.remove(2);
mutations.not();
mutations.opString('');
mutations.async(2);


// Component


function App(){
  const state = useIState(context, state => state + 1)

  return <span>{state}</span>
}