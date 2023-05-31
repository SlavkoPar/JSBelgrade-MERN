import { useTodoContext } from 'todos/TodoProvider'
import { useGlobalState } from 'global/GlobalProvider'

import TodoForm from "todos/components/TodoForm";
import { FormMode, ITodo } from "todos/types";

const EditTodo = ({ inLine }: {inLine: boolean}) => {
    const globalState = useGlobalState();
    const { state, updateTodo } = useTodoContext();
    const todo = state.todos.find(c=>c.inEditing);

    const submitForm = (todoObject: ITodo) => {
        const object: ITodo = {
            ...todoObject,
            modified: {
                date: new Date(),
                by: {
                    userId: globalState.authUser.userId
                }
            }
        }
        updateTodo(object)
    };

    return (
        <TodoForm
            inLine={inLine}
            todo={todo!}
            mode={FormMode.editing}
            submitForm={submitForm}
        >
            Update Todo
        </TodoForm>
    );
};

export default EditTodo;
