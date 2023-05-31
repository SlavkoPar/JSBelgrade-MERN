import { useEffect } from 'react'
import { Container, Row, Col, Button } from "react-bootstrap";

import { useParams } from 'react-router-dom'

import { Mode, ActionTypes } from "./types";

import { useGlobalState } from "global/GlobalProvider";
import { TodoProvider, useTodoContext, useTodoDispatch } from "./TodoProvider";

import TodoList from "todos/components/TodoList";
import ViewTodo from "todos/components/ViewTodo";
import EditTodo from "todos/components/EditTodo";

interface IProps {
    todoId_questionId: string | undefined
}

const Providered = ({ todoId_questionId }: IProps) => {

    const { state } = useTodoContext();
    const { lastTodoExpanded } = state;

    const dispatch = useTodoDispatch();

    if (lastTodoExpanded)
        return <div>loading...</div> 

    return (
        <Container>
            <div className="text-white">The best way to understand code structure<br/>is to investigate "TODO List" source code.</div>
            <Button variant="secondary" size="sm" type="button"
                onClick={() => dispatch({
                    type: ActionTypes.ADD_SUB_TODO,
                    payload: {
                        parentTodo: null,
                        level: 0
                    }
                })
                }
            >
                Add Todo
            </Button>
            <Row className="my-1">
                <Col xs={12} md={7}>
                    <div>
                        <TodoList level={1} title="root" />
                    </div>
                </Col>
                <Col xs={0} md={5}>
                    {/* <div class="d-none d-lg-block">hide on screens smaller than lg</div> */}
                    <div id='div-details' className="d-none d-md-block">
                        {state.mode === Mode.ViewingTodo && <ViewTodo inLine={false} />}
                        {state.mode === Mode.EditingTodo && <EditTodo inLine={false} />}
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

type Params = {
    todoId_questionId: string | undefined;
};

const Todos = () => {
    let { todoId_questionId } = useParams<Params>();

    if (todoId_questionId && todoId_questionId === 'null') 
        todoId_questionId = undefined;

    if (todoId_questionId) {
        const arr = todoId_questionId!.split('_');
        console.assert(arr.length === 2, "expected 'todoId-questionId'")
    }
    const globalState = useGlobalState();
    const { isAuthenticated } = globalState;

    if (!isAuthenticated)
        return <div>loading...</div>;

    return (
        <TodoProvider>
            <Providered todoId_questionId={todoId_questionId} />
        </TodoProvider>
    )
}

export default Todos;