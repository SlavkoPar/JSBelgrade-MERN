import { Types } from "mongoose";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faRemove, faCaretRight, faCaretDown, faPlus, faThumbsUp } from '@fortawesome/free-solid-svg-icons'

import { ListGroup, Button, Badge } from "react-bootstrap";

import { useGlobalState } from 'global/GlobalProvider'
import { ActionTypes, IMenuInfo, Mode } from "menus/types";
import { useMenuContext, useMenuDispatch } from 'menus/MenuProvider'
import { useHover } from 'common/components/useHover';
import { IMenu } from 'menus/types'

import MenuList from "menus/components/MenuList";
import AddMenu from "menus/components/AddMenu";
import EditMenu from "menus/components/EditMenu";
import ViewMenu from "menus/components/ViewMenu";
import MealList from "menus/components/meals/MealList";

const MenuRow = ({ menu }: { menu: IMenu }) => {
    const { _id, title, level, inViewing, inEditing, inAdding, numOfMeals, isExpanded } = menu;

    const { canEdit, isDarkMode, variant, bg } = useGlobalState();

    const { state, viewMenu, editMenu, deleteMenu } = useMenuContext();
    const dispatch = useMenuDispatch();

    const alreadyAdding = state.mode === Mode.AddingMenu;
    const showMeals = true; //meals && !meals.find(q => q.inAdding)

    const del = () => {
        deleteMenu(_id!);
    };

    const expand = (_id: Types.ObjectId) => {
        const collapse = isExpanded;
        dispatch({ type: ActionTypes.SET_EXPANDED, payload: { _id, expanding: !isExpanded } });
        if (collapse)
            dispatch({ type: ActionTypes.CLEAN_SUB_TREE, payload: { menu } })
    }

    const edit = (_id: Types.ObjectId) => {
        // Load data from server and reinitialize menu
        editMenu(_id);
    }

    const onSelectMenu = (_id: Types.ObjectId) => {
        // Load data from server and reinitialize menu
        viewMenu(_id);
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
                className={`py-0 mx-0 text-decoration-none ${(inViewing||inEditing) ? 'fw-bold':''}`}
                title={_id!.toString()}
                onClick={() => onSelectMenu(_id!)}
                disabled={alreadyAdding}
            >
                {title}
            </Button>

            <Badge pill bg="secondary" className={numOfMeals===0?'d-none':'d-inline'}>
                {numOfMeals}<FontAwesomeIcon icon={faThumbsUp} size='sm' />
            </Badge>

            {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <Button variant='link' size="sm" className="ms-1 py-0 px-0"
                    //onClick={() => { dispatch({ type: ActionTypes.EDIT, menu }) }}>
                    onClick={() => edit(_id!)}
                >
                    <FontAwesomeIcon icon={faEdit} size='lg' />
                </Button>
            }

            {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <Button variant='link' size="sm" className="ms-1 py-0 mx-1"
                    onClick={del}
                >
                    <FontAwesomeIcon icon={faRemove} size='lg' />
                </Button>
            }

            {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <Button variant='link' size="sm" className="ms-2 py-0 mx-1 text-primary" title="Add SubMenu" >
                    <FontAwesomeIcon icon={faPlus} size='lg'
                        onClick={() => {
                            dispatch({
                                type: ActionTypes.ADD_SUB_MENU,
                                payload: {
                                    parentMenu: menu._id,
                                    level: menu.level
                                }
                            })
                            if (!isExpanded)
                                dispatch({ type: ActionTypes.SET_EXPANDED, payload: { _id: _id!, expanding: true } });
                        }}
                    />
                </Button>
            }

            {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <Button variant='link' size="sm" className="ms-2 py-0 mx-1 text-secondary" title="Add Meal" >
                    <FontAwesomeIcon icon={faPlus} size='lg'
                        onClick={() => {
                            const menuInfo: IMenuInfo = { _id: menu._id!, level: menu.level }
                            dispatch({ type: ActionTypes.ADD_MEAL, payload: { menuInfo } })
                            if (!isExpanded)
                                dispatch({ type: ActionTypes.SET_EXPANDED, payload: { _id: _id!, expanding: true } });
                        }}
                    />
                    <FontAwesomeIcon icon={faThumbsUp} size='lg' style={{ marginLeft: '-5px' }} />
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
                {inAdding && state.mode === Mode.AddingMenu ? (
                    <AddMenu menu={menu} inLine={true} />
                )
                    : ((inEditing && state.mode === Mode.EditingMenu) ||
                        (inViewing && state.mode === Mode.ViewingMenu)) ? (
                        <>
                            {/* <div class="d-lg-none">hide on lg and wider screens</div> */}
                            <div className="ms-0 d-md-none w-100">
                                {inEditing && <EditMenu inLine={true} />}
                                {inViewing && <ViewMenu inLine={true} />}
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
                            <MenuList level={level + 1} parentMenu={_id!} title={title} />
                            {showMeals &&
                                <MealList level={level + 1} parentMenu={_id!} title={title} />
                            }
                        </>
                    }

                </ListGroup.Item>
            }
        </>
    );
};

export default MenuRow;
