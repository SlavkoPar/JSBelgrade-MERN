import { useGlobalState } from 'global/GlobalProvider'
import { createContext, useContext, useReducer, useCallback, Dispatch } from 'react';

import { Types } from 'mongoose';
import { ActionTypes, ITodo, ITodosContext } from 'todos/types';
import axios, { AxiosError } from "axios";
import { initialTodosState, TodosReducer } from 'todos/TodosReducer';

const TodosContext = createContext<ITodosContext>({} as any);
const TodoDispatchContext = createContext<Dispatch<any>>(() => null);

type Props = {
  children: React.ReactNode
}

export const TodoProvider: React.FC<Props> = ({ children }) => {

  const globalState = useGlobalState();
  const { wsId } = globalState.authUser;

  const [state, dispatch] = useReducer(TodosReducer, initialTodosState);
  
  const getSubTodos = useCallback(() => {
    const url = `/api/todos/get-sub-todos/${wsId}/null`
    //dispatch({ type: ActionTypes.SET_LOADING })
    axios
      .get(url)
      .then(({ data }) => {
        const subTodos = data.map((c: ITodo) => ({
          ...c
        }))
        dispatch({ type: ActionTypes.SET_SUB_TODOS, payload: { subTodos } });
      })
      .catch((error) => {
        console.log(error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error });
      });
  }, [wsId]);

  
  const createTodo = useCallback((todo: ITodo) => {
    dispatch({ type: ActionTypes.SET_LOADING }) // TODO treba li ovo 
    axios
      .post(`/api/todos/create-todo`, todo)
      .then(({ status, data }) => {
        if (status === 200) {
          console.log('Todo successfully created')
          dispatch({ type: ActionTypes.SET_ADDED_TODO, payload: { todo: { ...data } } });
          dispatch({ type: ActionTypes.CLOSE_TODO_FORM })
        }
        else {
          console.log('Status is not 200', status)
          dispatch({
            type: ActionTypes.SET_ERROR,
            payload: {
              error: new AxiosError('Status is not 200 status:' + status)
            }
          })
        }
      })
      .catch((error) => {
        console.log(error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error });
      });
  }, []);


  const getTodo = (_id: Types.ObjectId,
    type:
      ActionTypes.VIEW_TODO |
      ActionTypes.EDIT_TODO |
      ActionTypes.SET_TODO
  ) => {
    const url = `/api/todos/get-todo/${_id}`
    // dispatch({ type: ActionTypes.SET_LOADING })
    axios
      .get(url)
      .then(({ data: todo }) => {
        dispatch({ type, payload: { todo } });
      })
      .catch((error) => {
        console.log(error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error });
      });
  };

  const viewTodo = useCallback((_id: Types.ObjectId) => {
    getTodo(_id, ActionTypes.VIEW_TODO)
  }, []);

  const editTodo = useCallback((_id: Types.ObjectId) => {
    getTodo(_id, ActionTypes.EDIT_TODO)
  }, []);

  const updateTodo = useCallback((todo: ITodo) => {
    dispatch({ type: ActionTypes.SET_LOADING })
    const url = `/api/todos/update-todo/${todo._id}`
    axios
      .put(url, todo)
      .then(({ status, data: todo }) => {
        if (status === 200) {
          console.log("Todo successfully updated", todo);
          dispatch({ type: ActionTypes.SET_TODO, payload: { todo } });
          dispatch({ type: ActionTypes.CLOSE_TODO_FORM })
        }
        else {
          console.log('Status is not 200', status)
          dispatch({
            type: ActionTypes.SET_ERROR,
            payload: { error: new AxiosError('Status is not 200 status:' + status) }
          });
        }
      })
      .catch((error) => {
        console.log(error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error });
      });
  }, []);

  const deleteTodo = (_id: Types.ObjectId) => {
    // dispatch({ type: ActionTypes.SET_LOADING })
    axios
      .delete(`/api/todos/delete-todo/${_id}`)
      .then(res => {
        if (res.status === 200) {
          console.log("Todo successfully deleted");
          dispatch({ type: ActionTypes.DELETE, payload: { _id } });
        }
      })
      .catch((error) => {
        console.log(error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error });
      });
  };

  const contextValue: ITodosContext = {
    state,
    getSubTodos, createTodo, viewTodo, editTodo, updateTodo, deleteTodo
  }
  return (
    <TodosContext.Provider value={contextValue}>
      <TodoDispatchContext.Provider value={dispatch}>
        {children}
      </TodoDispatchContext.Provider>
    </TodosContext.Provider>
  );
}

export function useTodoContext() {
  return useContext(TodosContext);
}

export const useTodoDispatch = () => {
  return useContext(TodoDispatchContext)
};

