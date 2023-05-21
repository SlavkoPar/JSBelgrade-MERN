import { Types } from "mongoose";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faRemove, faCaretRight, faCaretDown, faPlus, faQuestion } from '@fortawesome/free-solid-svg-icons'

import { ListGroup, Button, Badge } from "react-bootstrap";

import { useGlobalState } from 'global/GlobalProvider'
import { ActionTypes, ICategoryInfo, Mode } from "categories/types";
import { useCategoryContext, useCategoryDispatch } from 'categories/CategoryProvider'
import { useHover } from 'common/components/useHover';
import { ICategory } from 'categories/types'

import CategoryList from "categories/components/CategoryList";
import AddCategory from "categories/components/AddCategory";
import EditCategory from "categories/components/EditCategory";
import ViewCategory from "categories/components/ViewCategory";
import QuestionList from "categories/components/questions/QuestionList";

const CategoryRow = ({ category }: { category: ICategory }) => {
    const { _id, title, level, inViewing, inEditing, inAdding, numOfQuestions, isExpanded } = category;

    const { canEdit, isDarkMode, variant, bg } = useGlobalState();

    const { state, viewCategory, editCategory, deleteCategory } = useCategoryContext();
    const dispatch = useCategoryDispatch();

    const alreadyAdding = state.mode === Mode.AddingCategory;
    const showQuestions = true; //questions && !questions.find(q => q.inAdding)

    const del = () => {
        deleteCategory(_id!);
    };

    const expand = (_id: Types.ObjectId) => {
        dispatch({ type: ActionTypes.SET_EXPANDED, payload: { _id, expanding: !isExpanded } });
    }

    // const edit = (_id: Types.ObjectId) => {
    //     // Load data from server and reinitialize category
    //     editCategory(_id);
    // }

    const onSelectCategory = (_id: Types.ObjectId) => {
        // Load data from server and reinitialize category
        if (canEdit)
            editCategory(_id);
        else
            viewCategory(_id);
    }

    const [hoverRef, hoverProps] = useHover();

    const Row1 =
        <div ref={hoverRef} className="d-flex justify-content-start align-items-center w-100 text-primary">
            <Button
                variant='link'
                size="sm"
                className="py-0 px-1"
                onClick={() => expand(_id!)}
                title="Expand"
                disabled={alreadyAdding}
            >
                <FontAwesomeIcon icon={isExpanded ? faCaretDown : faCaretRight} size='lg' />
            </Button>
            <Button
                variant='link'
                size="sm"
                className={`py-0 mx-0 text-decoration-none ${(inViewing || inEditing) ? 'fw-bold' : ''}`}
                title={_id!.toString()}
                onClick={() => onSelectCategory(_id!)}
                disabled={alreadyAdding}
            >
                {title}
            </Button>

            <Badge pill bg="secondary" className={numOfQuestions === 0 ? 'd-none' : 'd-inline'}>
                {numOfQuestions}<FontAwesomeIcon icon={faQuestion} size='sm' />
            </Badge>

            {/* {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <Button variant='link' size="sm" className="ms-1 py-0 px-0"
                    //onClick={() => { dispatch({ type: ActionTypes.EDIT, category }) }}>
                    onClick={() => edit(_id!)}
                >
                    <FontAwesomeIcon icon={faEdit} size='lg' />
                </Button>
            } */}

            {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <Button variant='link' size="sm" className="ms-1 py-0 mx-1"
                    onClick={del}
                >
                    <FontAwesomeIcon icon={faRemove} size='lg' />
                </Button>
            }

            {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <Button
                    variant='link'
                    size="sm"
                    className="ms-2 py-0 mx-1 text-primary"
                    title="Add SubCategory"
                    onClick={() => {
                        dispatch({
                            type: ActionTypes.ADD_SUB_CATEGORY,
                            payload: {
                                parentCategory: category._id,
                                level: category.level
                            }
                        })
                        if (!isExpanded)
                            dispatch({ type: ActionTypes.SET_EXPANDED, payload: { _id: _id!, expanding: true } });
                    }}
                >
                    <FontAwesomeIcon icon={faPlus} size='lg' />
                </Button>
            }

            {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <Button
                    variant='link'
                    size="sm"
                    className="ms-2 py-0 mx-1 text-secondary"
                    title="Add Question"
                    onClick={() => {
                        const categoryInfo: ICategoryInfo = { _id: category._id!, level: category.level }
                        dispatch({ type: ActionTypes.ADD_QUESTION, payload: { categoryInfo } })
                        if (!isExpanded)
                            dispatch({ type: ActionTypes.SET_EXPANDED, payload: { _id: _id!, expanding: true } });
                    }}
                >
                    <FontAwesomeIcon icon={faPlus} size='lg' />
                    <FontAwesomeIcon icon={faQuestion} size='lg' style={{ marginLeft: '-5px' }} />
                </Button>
            }
        </div>

    // console.log({ title, isExpanded })
    return (
        <>
            <ListGroup.Item
                variant={"primary"}
                className="py-0 px-1 w-100"
                as="li"
            >
                {inAdding && state.mode === Mode.AddingCategory ? (
                    <AddCategory category={category} inLine={true} />
                )
                    : ((inEditing && state.mode === Mode.EditingCategory) ||
                        (inViewing && state.mode === Mode.ViewingCategory)) ? (
                        <>
                            {/* <div class="d-lg-none">hide on lg and wider screens</div> */}
                            <div className="ms-0 d-md-none w-100">
                                {inEditing && <EditCategory inLine={true} />}
                                {inViewing && <ViewCategory inLine={true} />}
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

            {/* !inAdding && */}
            {(isExpanded || inViewing || inEditing) && // Row2
                <ListGroup.Item
                    className="py-0 px-0"
                    variant={"primary"}
                    as="li"
                >
                    {isExpanded &&
                        <>
                            <CategoryList level={level + 1} parentCategory={_id!} title={title} />
                            { showQuestions &&
                                <QuestionList level={level + 1} parentCategory={_id!} title={title} />
                            }
                        </>
                    }

                </ListGroup.Item>
            }
        </>
    );
};

export default CategoryRow;
