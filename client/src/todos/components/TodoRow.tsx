import { Types } from "mongoose";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRemove, faTornado } from '@fortawesome/free-solid-svg-icons'

import { ListGroup, Button, Badge } from "react-bootstrap";

import { useGlobalState } from 'global/GlobalProvider'
import { useTodoContext, useTodoDispatch } from 'todos/TodoProvider'
import { useHover } from 'common/components/useHover';
import { Mode, ITodo } from 'todos/types'

import AddTodo from "todos/components/AddTodo";
import EditTodo from "todos/components/EditTodo";
import ViewTodo from "todos/components/ViewTodo";

const TodoRow = ({ todo }: { todo: ITodo }) => {
    const { _id, title, inViewing, inEditing, inAdding } = todo;

    const { canEdit, isDarkMode, variant, bg } = useGlobalState();

    const { state, viewTodo, editTodo, deleteTodo } = useTodoContext();

    const alreadyAdding = state.mode === Mode.AddingTodo;
    
    const del = () => {
        deleteTodo(_id!);
    };
  
    // const edit = (_id: Types.ObjectId) => {
    //     // Load data from server and reinitialize todo
    //     editTodo(_id);
    // }

    const onSelectTodo = (_id: Types.ObjectId) => {
        // Load data from server and reinitialize todo
        if (canEdit)
            editTodo(_id);
        else
            viewTodo(_id);
    }

    const [hoverRef, hoverProps] = useHover();

    const Row1 =
        <div ref={hoverRef} className="d-flex justify-content-start align-items-center w-100 text-primary">
            <Button
                variant='link'
                size="sm"
                className="py-0 px-1"
                title="Expand"
                disabled={alreadyAdding}
            >
                <FontAwesomeIcon icon={faTornado} size='lg' />
            </Button>
            <Button
                variant='link'
                size="sm"
                className={`py-0 mx-0 text-decoration-none ${(inViewing || inEditing) ? 'fw-bold' : ''}`}
                title={_id!.toString()}
                onClick={() => onSelectTodo(_id!)}
                disabled={alreadyAdding}
            >
                {title}
            </Button>

            {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <Button variant='link' size="sm" className="ms-1 py-0 mx-1"
                    onClick={del}
                >
                    <FontAwesomeIcon icon={faRemove} size='lg' />
                </Button>
            }

        </div>

    // console.log({ title, isExpanded })
    return (
        <ListGroup.Item
            variant={"primary"}
            className="py-0 px-1 w-100"
            as="li"
        >
            {inAdding && state.mode === Mode.AddingTodo ? (
                <AddTodo todo={todo} inLine={true} />
            )
                : ((inEditing && state.mode === Mode.EditingTodo) ||
                    (inViewing && state.mode === Mode.ViewingTodo)) ? (
                    <>
                        {/* <div class="d-lg-none">hide on lg and wider screens</div> */}
                        <div className="ms-0 d-md-none w-100">
                            {inEditing && <EditTodo inLine={true} />}
                            {inViewing && <ViewTodo inLine={true} />}
                        </div>
                        <div className="d-none d-md-block">
                            {Row1}
                        </div>
                    </>
                )
                    : (
                        Row1
                    )
            }
        </ListGroup.Item>
    );
};

export default TodoRow;
