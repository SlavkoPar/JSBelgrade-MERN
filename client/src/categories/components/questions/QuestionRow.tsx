import { Types } from "mongoose";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faRemove, faQuestion, faPlus, faReply } from '@fortawesome/free-solid-svg-icons'

import { ListGroup, Button, Badge } from "react-bootstrap";

import { useGlobalState } from 'global/GlobalProvider'
import { ActionTypes, ICategoryInfo, Mode } from "categories/types";
import { useCategoryContext, useCategoryDispatch } from 'categories/CategoryProvider'
import { useHover } from 'common/components/useHover';
import { IQuestion } from 'categories/types'

import AddQuestion from "categories/components/questions/AddQuestion";
import EditQuestion from "categories/components/questions/EditQuestion";
import ViewQuestion from "categories/components/questions/ViewQuestion";

const QuestionRow = ({ question, categoryInAdding }: { question: IQuestion, categoryInAdding: boolean | undefined }) => {
    const { _id, parentCategory, level, title, inViewing, inEditing, inAdding} = question;

    const { canEdit, isDarkMode, variant, bg } = useGlobalState();

    const { state, viewQuestion, editQuestion, deleteQuestion } = useCategoryContext();
    const dispatch = useCategoryDispatch();

    const alreadyAdding = state.mode === Mode.AddingQuestion;

    const del = () => {
        deleteQuestion(_id!);
    };

    const edit = (_id: Types.ObjectId) => {
        // Load data from server and reinitialize question
        editQuestion(_id);
    }

    const onSelectQuestion = (_id: Types.ObjectId) => {
        // Load data from server and reinitialize question
        viewQuestion(_id);
    }
    const [hoverRef, hoverProps] = useHover();

    const Row1 =
        <div ref={hoverRef} className="d-flex justify-content-start align-items-center w-100 text-secondary">
            <Button
                variant='link'
                size="sm"
                className="py-0 px-1 text-secondary"
            >
                <FontAwesomeIcon
                    icon={faQuestion}
                    size='sm'
                />
            </Button>

            <Button
                variant='link'
                size="sm"
                className="py-0 mx-0 text-decoration-none text-secondary"
                title={_id!.toString()}
                onClick={() => onSelectQuestion(_id!)}
                disabled={alreadyAdding}
            >
                {title}
            </Button>

            {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <Button variant='link' size="sm" className="ms-1 py-0 px-1 text-secondary"
                    //onClick={() => { dispatch({ type: ActionTypes.EDIT, question }) }}>
                    onClick={() => edit(_id!)}
                >
                    <FontAwesomeIcon icon={faEdit} size='lg' />
                </Button>
            }

            {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <Button variant='link' size="sm" className="ms-1 py-0 mx-1 text-secondary"
                    onClick={del}
                >
                    <FontAwesomeIcon icon={faRemove} size='lg' />
                </Button>
            }

            {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <Button variant='link' size="sm" className="ms-2 py-0 mx-1 text-secondary" title="Add Question" >
                    <FontAwesomeIcon icon={faPlus} size='lg'
                        onClick={() => {
                            const categoryInfo: ICategoryInfo = { _id: parentCategory, level }
                            dispatch({ type: ActionTypes.ADD_QUESTION, payload: { categoryInfo } })
                        }}
                    />
                    <FontAwesomeIcon icon={faQuestion} size='lg' style={{ marginLeft: '-5px' }} />
                </Button>
            }
        </div>

    return (
        <ListGroup.Item
            variant={"secondary"}
            className="py-0 px-1 w-100"
            as="li"
        >
            {inAdding && categoryInAdding && state.mode === Mode.AddingQuestion ? (
                <AddQuestion question={question} inLine={true} />
            )
                : ((inEditing && state.mode === Mode.EditingQuestion) ||
                    (inViewing && state.mode === Mode.ViewingQuestion)) ? (
                    <>
                        {/* <div class="d-lg-none">hide on lg and wider screens</div> */}
                        <div className="ms-0 d-md-none w-100">
                            {inEditing && <EditQuestion inLine={true} />}
                            {inViewing && <ViewQuestion inLine={true} />}
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

export default QuestionRow;
