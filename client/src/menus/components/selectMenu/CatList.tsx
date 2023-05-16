import { useEffect, useReducer } from "react";
import { ListGroup } from "react-bootstrap";
import CatRow from "menus/components/selectMenu/CatRow";
import { CatsActionTypes, ICatInfo, IMenu } from "menus/types";
import { useMenuContext } from "menus/MenuProvider";
import { CatsReducer, initialState } from "./CatsReducer";

const CatList = ({ parentMenu, level, setParentMenu }: ICatInfo) => {
    const [state, dispatch] = useReducer(CatsReducer, initialState);
    const { getSubCats } = useMenuContext();
    useEffect(() => {
        (async () => {
            const subCats = await getSubCats({ parentMenu, level });
            console.log('getSubCats', parentMenu, level, subCats);
            dispatch({ type: CatsActionTypes.SET_SUB_CATS, payload: { subCats } });
        })()
    }, [getSubCats, parentMenu, level]);

    const mySubMenus = state.cats.filter(c => c.parentMenu === parentMenu);

    const setParentCat = (cat: IMenu) => {
        dispatch({ type: CatsActionTypes.SET_PARENT_MENU, payload: { menu: cat } })
        setParentMenu!(cat);
    }

    return (
        <div className={level > 1 ? 'ms-4' : ''}>
            <>
                <ListGroup as="ul" variant='dark' className="mb-0">
                    {mySubMenus.map(menu =>
                        <CatRow
                            menu={menu}
                            dispatch={dispatch}
                            setParentMenu={setParentCat}
                            key={menu._id!.toString()}
                        />
                    )
                    }
                </ListGroup>

                {state.error && state.error}
            </>
        </div>
    );
};

export default CatList;
