import { useState } from "react";
import { useTodoContext } from 'todos/TodoProvider'
import { useGlobalState } from 'global/GlobalProvider'

import TodoForm from "todos/components/TodoForm";
import InLineTodoForm from "todos/components/InLineTodoForm";
import { FormMode, ITodo } from "todos/types";

const AddTodo = ({ todo, inLine } : { todo: ITodo, inLine: boolean}) => {
    const globalState = useGlobalState();
    const { userId, wsId } = globalState.authUser;
    const { createTodo } = useTodoContext();
    const [formValues] = useState(todo)

    const submitForm = (todoObject: ITodo) => {
        delete todoObject.inAdding;
        const object: ITodo = {
            ...todoObject,
            _id: undefined,
            wsId, 
            created: {
                date: new Date(),
                by: {
                    userId
                }
            }
        }
        createTodo(object);
    }

    return (
        <>
            {inLine ?
                <InLineTodoForm
                    inLine={true}
                    todo={formValues}
                    mode={FormMode.adding}
                    submitForm={submitForm}
                >
                    Create
                </InLineTodoForm>
                :
                <TodoForm
                    inLine={false}
                    todo={formValues}
                    mode={FormMode.adding}
                    submitForm={submitForm}
                >
                    Create Todo
                </TodoForm >
            }
        </>
    )
}

export default AddTodo
