import { useEffect } from "react";
import { ListGroup } from "react-bootstrap";
import MenuRow from "menus/components/MenuRow";
import { IParentInfo } from "menus/types";
import { useMenuContext } from "menus/MenuProvider";

const MenuList = ({ title, parentMenu, level }: IParentInfo) => {
    const { state, getSubMenus } = useMenuContext();
    useEffect(() => {
        console.log('getSubMenus', title, level)
        getSubMenus({ parentMenu, level });
    }, [getSubMenus, title, parentMenu, level]);

    const mySubMenus = state.menus.filter(c => c.parentMenu === parentMenu);
    return (
        <div className={level>1?'ms-4':''}>
            <>
                <ListGroup as="ul" variant='dark' className="mb-0">
                    {mySubMenus.map(menu => 
                        <MenuRow menu={menu} key={menu._id!.toString()} />)
                    }
                </ListGroup>

                {state.error && state.error}
                {/* {state.loading && <div>...loading</div>} */}
            </>
        </div>
    );
};

export default MenuList;
