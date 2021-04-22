# infinity-state

## Um pacote de gerenciamento de estado para aplicações react

## Motivação
Todos nos sabemos que redux é um ótimo aliado na construção de aplicações react com fluxo de dados mais complexos, com ele a tarefa de gerenciar o estado da aplicação e o sincronismo de dados entre os componentes torna-se muito fácil.

Porem em muitos casos o excesso de código em torno do redux torna o uso dele desestimulante, essa sensação aumenta ao perceber que a maioria desse código é repetitivo.

Outro fator que desestimula o uso do redux é quando é necessário usar fluxos assíncronos, nesses casos é necessário fazer uso de um pacote extra para lidar com os fluxos assíncronos, exemplo Redux-Saga, Redux-Thunk, Redux-Observable. Todos esses pacotes executam essa tarefa muito bem. Porem ao usar essas soluções a parte síncrona fica separada da assíncrona, e por mais que isso faça sentido, não aparenta ser um fluxo natural.

Com o redux temos um único objeto de estado para toda a aplicação, e isso pode ser tornar algo ruim se desejarmos usar o redux para gerenciar alguma logica de componentes com a logica de negocio da aplicação sem contar que ter todo o estado da aplicação em um único objeto pode trazer alguns problemas.
Seria bom se tivéssemos um objeto gerenciável para cada contexto da aplicação e podendo separar a parte de logica de componentes da parte de logica de negócio da aplicação.

Com a api de `context` do react podemos ter esse recurso de um objeto de estado para cada contexto da aplicação, porem ele ainda não supri todas as nossas necessidades, uma vez que para ter um gerenciamento de estado com a os recursos de `contexto de react`, `useContext` e `useReducer` seria necessário criar uma considerável quantidade de código e no final seria criado algo quase idêntico ao redux. Outro ponto negativo é que quando se cria um contexto no react ele afeta apenas os componentes que estão abaixo da do componente no qual o `provider` do contexto esta declarado, desse modo não é possível ter componentes em diferentes pontos da arvore usando o mesmo contexto.



### A solução proposta

O infinity-state vem para tentar resolver esses dois pontos e tornar o gerenciamento de estado mais simples e deixar o código organizado de forma mais logica.

Infinity-state é um pacote javascript que tem como objetivo prover um dado gerenciável unicamente através de funções puras que produzem mutações no dado.

Usuário redux podem usar facilmente essa solução de gerenciamento de estado, pois o pacote é fortemente inspirado nele.


## Criando um dado gerenciável

Para criar um dado gerenciável é necessário criar um instancia da classe `State`, e passar um objeto para ele, a seguir será descrito a estrutura do objeto:

### state
State é a key do objeto que recebe o dado que será gerenciado.

### methods
Methods é a key que recebe um objeto com as funções responsáveis por fazer as mutações no `state`.

### services
Em alguns casos é necessário realizar algum processamento assíncrono antes de produzir alguma mutação no state. Por exemplo fazer um requisição http para uma api e depois que o processo assíncrono é resolvido em caso de sucesso ou falha o dado resultante precisa realizar alguma mutação no state. A key services recebe um objeto com as funções responsáveis por realizar esse trabalho.

### context
Context é o nome dado a instancia de `State`, com esse objeto é possível obter o estado, se inscrever e obter as mutações que ocorrem no state, como o infinity-state exporta um hook para componentes react obter sempre a ultima versão do state a cada mutação a inscrita de eventos de mutação não é algo que deva se preocupar, a menos que queira criar hooks personalizados para sua necessidade.

Context também possui um objeto chamado mutações que contem uma função para cada method ou service cadastrado, mais detalhes sobre essas funções serão dadas na próxima seção, por hora convém saber que elas são chamadas de `mutations` .

### mutations
Mutations são basicamente as `action criators` do ambiente redux, com a diferença que com elas não é preciso de tipos para diferenciar as intenções de mudanças no state e nem é necessário usar a função `dispatch` para que a ação seja disparada.

### Exemplo de uma função com fluxo assíncrono usando Promise:
```typescript
const fetch: Service<TodosState> = ({state}) =>
  Axios.get('https://yourapi')
    .then(resp =>resp.data.map(item => item))
    .then(data => mutations.success(data))
    .catch(err => mutations.failure(err.data))

```

### Exemplo de uma função com fluxo assíncrono usando Rxjs:
```typescript
const fetchRxjs: Service<TodosState, undefined, Subscription> = ({state}) =>
  from(Axios.get('https://yourapi'))
    .subscribe(
      resp => mutations.success(resp.data)),
      err => mutations.failure(err.data))
    )

```

### Exemplo de uma função com fluxo síncrono:
```typescript
const success:Method<TodosState, Array<Todo>> = ({state, payload}) =>
  [...state, ...payload]
```

### Criando um state

No exemplo esta sendo utilizado o `typescript`, sinta-se a vontade para utilizar `javascript`


```typescript
export interface Todo {
  id: number
  text: string
  complete: boolean
}

export type TodosState = Array<Todo>

const INITIAL_STATE: TodosState = []

const add: Method<TodosState, string> = ({state, payload}) =>
  [
    ...state,
    { id: Math.random(), text: payload, complete: false }
  ]

const toggle: Method<TodosState, number> = ({state, payload}) =>
  state.map(
    (todo: Todo) =>
      todo.id === payload ? { ...todo, complete: !todo.complete } : todo
  )

const remove: Method<TodosState, number> = ({state, payload}) =>
  state.filter((todo: Todo) => todo.id !== payload)

const fetch: Service<TodosState> = () =>
  Axios.get('https://yourapi')
    .then(resp =>resp.data.map(item => item))
    .then(data => mutations.success(data))
    .catch(err => mutations.failure(err.data))

const success:Method<TodosState, Array<Todo>> = ({state, payload}) =>
  [...state, ...payload]

export const context = new State({
  state: INITIAL_STATE,
  methods: {
    reset,
    failure,
    success,
    remove,
    add,
    toggle
  },
  services: {
    fetch
  }
})
```

### Usando mutations

Como dito mutations é o caminho para realizar mutações no `state`, elas estão disponíveis na instancia de `new State`.

```typescript
const {fetchPromise, reset} = context.mutations;
```

```typescript
<form onSubmit={handleSubmit}>
    <input value={inputText} onChange={(e) => setInputText(e.target.value} />
    <button type="submit">Novo</button>
    <button type="button" onClick={() =>fetchPromise())} >Async Promise</button>
    <button type="button" onClick={() => reset())}>RESET</button>
</form>
```

### Usando useIState

useIState é um hook que possibilita receber as atualizações de state, esse hook recebe o `context` e uma função que serve para filtrar, alterar a porção de estado que se deseja receber.

```typescript
const todos = useIState(
    context,
    state => state.todos
)
```

### Exemplo de implementação 
Você pode ver o código fonte de um exemplo de implementação com fluxos assíncronos aqui:
 * https://github.com/Jucian0/infininty-state-exemple

Ou pode brincar com a aplicação no `CodeSandbox`
* https://codesandbox.io/s/infinity-state-tkv6f
