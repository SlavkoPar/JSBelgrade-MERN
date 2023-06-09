import { useEffect } from 'react'
import { Container, Row, Col, Button } from "react-bootstrap";

import { useParams } from 'react-router-dom'

import { Mode, ActionTypes } from "./types";

import { useGlobalState } from "global/GlobalProvider";
import { MenuProvider, useMenuContext, useMenuDispatch } from "./MenuProvider";

import MenuList from "menus/components/MenuList";
import ViewMenu from "menus/components/ViewMenu";
import EditMenu from "menus/components/EditMenu";
import ViewMeal from "menus/components/meals/ViewMeal";
import EditMeal from "menus/components/meals/EditMeal";

interface IProps {
    menuId_mealId: string | undefined
}

const Providered = ({ menuId_mealId }: IProps) => {

    const { state, reloadMenuNode } = useMenuContext();
    const { lastMenuExpanded } = state;

    const dispatch = useMenuDispatch();

    useEffect(() => {
        (async () => {
            if (lastMenuExpanded) {
                await reloadMenuNode(lastMenuExpanded, null);
            }
        })()
    }, [lastMenuExpanded, reloadMenuNode, menuId_mealId])

    if (lastMenuExpanded)
        return <div>loading...</div>

    return (
        <Container>
            <Button variant="secondary" size="sm" type="button"
                onClick={() => dispatch({
                    type: ActionTypes.ADD_SUB_MENU,
                    payload: {
                        parentMenu: null,
                        level: 0
                    }
                })
                }
            >
                Add Menu
            </Button>
            <Row className="my-1">
                <Col xs={12} md={7}>
                    <div>
                        <MenuList parentMenu={null} level={1} title="root" />
                    </div>
                </Col>
                <Col xs={0} md={5}>
                    {/* <div class="d-none d-lg-block">hide on screens smaller than lg</div> */}
                    <div id='div-details' className="d-none d-md-block">
                        {state.mode === Mode.ViewingMenu && <ViewMenu inLine={false} />}
                        {state.mode === Mode.EditingMenu && <EditMenu inLine={false} />}
                        {state.mode === Mode.ViewingMeal && <ViewMeal inLine={false} />}
                        {state.mode === Mode.EditingMeal && <EditMeal inLine={false} />}
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

type Params = {
    menuId_mealId: string | undefined;
};

const Menus = () => {
    let { menuId_mealId } = useParams<Params>();

    if (menuId_mealId && menuId_mealId === 'null') 
        menuId_mealId = undefined;

    if (menuId_mealId) {
        const arr = menuId_mealId!.split('_');
        console.assert(arr.length === 2, "expected 'menuId-mealId'")
    }
    const globalState = useGlobalState();
    const { isAuthenticated } = globalState;

    if (!isAuthenticated)
        return <div>loading...</div>;

    return (
        <MenuProvider>
            <Providered menuId_mealId={menuId_mealId} />
        </MenuProvider>
    )
}

export default Menus;