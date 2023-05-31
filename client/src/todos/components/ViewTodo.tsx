import { useTodoContext } from 'todos/TodoProvider'

import { FormMode } from "todos/types";
import TodoForm from "todos/components/TodoForm";

const ViewTodo = ({ inLine }: {inLine: boolean}) => {
    const { state } = useTodoContext();
    const todo = state.todos.find(c=>c.inViewing);

    return (
        <TodoForm
            inLine={inLine}
            todo={todo!}
            mode={FormMode.viewing}
            submitForm={() => {}}
        >
            Update Todo
        </TodoForm>
    );
}

export default ViewTodo;
