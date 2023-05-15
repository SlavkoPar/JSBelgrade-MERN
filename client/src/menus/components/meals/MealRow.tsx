import { Types } from "mongoose";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faRemove, faThumbsUp, faPlus, faReply } from '@fortawesome/free-solid-svg-icons'

import { ListGroup, Button, Badge } from "react-bootstrap";

import { useGlobalState } from 'global/GlobalProvider'
import { ActionTypes, IMenuInfo, Mode } from "menus/types";
import { useMenuContext, useMenuDispatch } from 'menus/MenuProvider'
import { useHover } from 'common/components/useHover';
import { IMeal } from 'menus/types'

import AddMeal from "menus/components/meals/AddMeal";
import EditMeal from "menus/components/meals/EditMeal";
import ViewMeal from "menus/components/meals/ViewMeal";

const MealRow = ({ meal, menuInAdding }: { meal: IMeal, menuInAdding: boolean | undefined }) => {
    const { _id, parentMenu, level, title, inViewing, inEditing, inAdding } = meal;

    const { canEdit, isDarkMode, variant, bg } = useGlobalState();

    const { state, viewMeal, editMeal, deleteMeal } = useMenuContext();
    const dispatch = useMenuDispatch();

    const alreadyAdding = state.mode === Mode.AddingMeal;

    const del = () => {
        deleteMeal(_id!);
    };

    const edit = (_id: Types.ObjectId) => {
        // Load data from server and reinitialize meal
        editMeal(_id);
    }

    const onSelectMeal = (_id: Types.ObjectId) => {
        // Load data from server and reinitialize meal
        if (canEdit)
            editMeal(_id);
        else 
            viewMeal(_id);
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
                    icon={faThumbsUp}
                    size='sm'
                />
            </Button>

            <Button
                variant='link'
                size="sm"
                className={`py-0 mx-0 text-decoration-none text-secondary ${(inViewing || inEditing) ? 'fw-bold' : ''}`}
                title={_id!.toString()}
                onClick={() => onSelectMeal(_id!)}
                disabled={alreadyAdding}
            >
                {title}
            </Button>

            {/* {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <Button variant='link' size="sm" className="ms-1 py-0 px-1 text-secondary"
                    //onClick={() => { dispatch({ type: ActionTypes.EDIT, meal }) }}>
                    onClick={() => edit(_id!)}
                >
                    <FontAwesomeIcon icon={faEdit} size='lg' />
                </Button>
            } */}

            {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <Button variant='link' size="sm" className="ms-1 py-0 mx-1 text-secondary"
                    onClick={del}
                >
                    <FontAwesomeIcon icon={faRemove} size='lg' />
                </Button>
            }

            {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <Button
                    variant='link'
                    size="sm"
                    className="ms-2 py-0 mx-1 text-secondary"
                    title="Add Meal"
                    onClick={() => {
                        const menuInfo: IMenuInfo = { _id: parentMenu, level }
                        dispatch({ type: ActionTypes.ADD_MEAL, payload: { menuInfo } })
                    }}
                >
                    <FontAwesomeIcon icon={faPlus} size='lg' />
                    <FontAwesomeIcon icon={faThumbsUp} size='lg' style={{ marginLeft: '-5px' }} />
                </Button>
            }
        </div>

    return (
        <ListGroup.Item
            variant={"secondary"}
            className="py-0 px-1 w-100"
            as="li"
        >
            {inAdding && menuInAdding && state.mode === Mode.AddingMeal ? (
                <AddMeal meal={meal} inLine={true}  showCloseButton={true} />
            )
                : ((inEditing && state.mode === Mode.EditingMeal) ||
                    (inViewing && state.mode === Mode.ViewingMeal)) ? (
                    <>
                        {/* <div class="d-lg-none">hide on lg and wider screens</div> */}
                        <div className="ms-0 d-md-none w-100">
                            {inEditing && <EditMeal inLine={true} />}
                            {inViewing && <ViewMeal inLine={true} />}
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

export default MealRow;
