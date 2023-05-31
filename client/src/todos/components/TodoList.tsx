import { useEffect } from "react";
import { ListGroup } from "react-bootstrap";
import TodoRow from "todos/components/TodoRow";
import { IParentInfo } from "todos/types";
import { useTodoContext } from "todos/TodoProvider";

const TodoList = ({ title }: IParentInfo) => {
    const { state, getSubTodos } = useTodoContext();
    useEffect(() => {
        console.log('getSubTodos', title)
        getSubTodos();
    }, [getSubTodos, title]);

    const mySubTodos = state.todos;
    return (
        <div className="ms-2">
            <>
                <ListGroup as="ul" variant='dark' className="mb-0">
                    {mySubTodos.map(todo => 
                        <TodoRow todo={todo} key={todo._id!.toString()} />)
                    }
                </ListGroup>

                {state.error && state.error}
                {/* {state.loading && <div>...loading</div>} */}
            </>
        </div>
    );
};

export default TodoList;
