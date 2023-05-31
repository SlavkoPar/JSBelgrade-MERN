import { Reducer } from 'react'
import { Mode, ActionTypes, ITodosState, ITodo, TodosActions } from "todos/types";
import { Types } from 'mongoose';


export const initialTodo: ITodo = {
  // temp _id for inAdding, to server as list key
  // it will be removed on submitForm
  // real _id will be given by the MongoDB 
  wsId: new Types.ObjectId("000000000000000000000000"),
  _id: new Types.ObjectId("000000000000000000000000"),
  title: '',
  parentTodo: null
}

export const initialState: ITodosState = {
  mode: Mode.NULL,
  loading: false,
  todos: [],
  currentTodoExpanded: '',
  lastTodoExpanded: null
}

let initialStateFromLocalStorage: ITodosState | undefined;

const hasMissingProps = (): boolean => {
  let b = false;
  const keys = Object.keys(initialStateFromLocalStorage!)
  Object.keys(initialState).forEach((prop: string) => {
    if (!keys.includes(prop)) {
      b = true;
      console.log('missing prop:', prop, ' try with SignOut')
    }
  })
  return b;
}

if ('localStorage' in window) {
  const s = localStorage.getItem('TODOS_STATE');
  if (s !== null) {
    initialStateFromLocalStorage = JSON.parse(s);
    if (hasMissingProps()) {
      initialStateFromLocalStorage = undefined;
    }
    else {
      const { currentTodoExpanded } = initialStateFromLocalStorage!;
      initialStateFromLocalStorage = {
        ...initialStateFromLocalStorage!,
        lastTodoExpanded: currentTodoExpanded
      }
      console.log('todos initialState FromLocalStorage', { initialStateFromLocalStorage });
    }
  }
}

export const initialTodosState: ITodosState = initialStateFromLocalStorage
  ? initialStateFromLocalStorage
  : initialState

export const TodosReducer: Reducer<ITodosState, TodosActions> = (state, action) => {
  const newState = reducer(state, action);
  const aTypesToStore: ActionTypes[] = [
    // ActionTypes.SET_EXPANDED
  ];
  if (aTypesToStore.includes(action.type)) {
    const value = JSON.stringify({
      ...initialState,
      currentTodoExpanded: newState.currentTodoExpanded
    })
    localStorage.setItem('TODOS_STATE', value);
  }
  return newState;
}

const reducer = (state: ITodosState, action: TodosActions) => {
  switch (action.type) {

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: true
      }

    case ActionTypes.SET_SUB_TODOS: {
      const { subTodos } = action.payload;
      const todos = state.todos.concat(subTodos);
      return {
        ...state,
        todos,
        loading: false
      };
    }
    

    case ActionTypes.SET_ERROR: {
      const { error } = action.payload;
      return { ...state, error, loading: false };
    }

    case ActionTypes.ADD_SUB_TODO: {
      const todo: ITodo = {
        ...initialTodo,
        title: '',
        inAdding: true
      }
      return {
        ...state,
        todos: [todo, ...state.todos],
        mode: Mode.AddingTodo
      };
    }

    case ActionTypes.SET_ADDED_TODO: {
      const { todo } = action.payload;
      // todo doesn't contain inViewving, inEditing, inAdding 
      return {
        ...state,
        todos: state.todos.map(c => c.inAdding ? todo : c),
        mode: Mode.NULL,
        loading: false
      }
    }

    case ActionTypes.SET_TODO: {
      const { todo } = action.payload; // todo doesn't contain inViewing, inEditing, inAdding 
      return {
        ...state,
        todos: state.todos.map(c => c._id === todo._id
          ? {
            ...todo,
            inViewing: c.inViewing,
            inEditing: c.inEditing,
            inAdding: c.inAdding
          }
          : c),
        // keep mode
        loading: false
      }
    }

    case ActionTypes.VIEW_TODO: {
      const { todo } = action.payload;
      return {
        ...state,
        todos: state.todos.map(c => c._id === todo._id
          ? { ...todo, inViewing: true }
          : { ...c, inViewing: false }
        ),
        mode: Mode.ViewingTodo,
        loading: false
      };
    }

    case ActionTypes.EDIT_TODO: {
      const { todo } = action.payload;
      return {
        ...state,
        todos: state.todos.map(c => c._id === todo._id
          ? { ...todo, inEditing: true }
          : { ...c, inEditing: false }
        ),
        mode: Mode.EditingTodo,
        loading: false
      };
    }

    case ActionTypes.DELETE: {
      const { _id } = action.payload;
      return {
        ...state,
        mode: Mode.NULL,
        todos: state.todos.filter(c => c._id !== _id)
      };
    }

    case ActionTypes.CANCEL_TODO_FORM:
    case ActionTypes.CLOSE_TODO_FORM: {
      const todos = state.mode === Mode.AddingTodo
        ? state.todos.filter(c => !c.inAdding)
        : state.todos
      return {
        ...state,
        mode: Mode.NULL,
        todos: todos.map(c => ({ ...c, inViewing: false, inEditing: false, inAdding: false }))
      };
    }

    default:
      return state;  // TODO throw error
  }
};

