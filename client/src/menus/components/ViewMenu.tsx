import { useMenuContext } from 'menus/MenuProvider'

import { FormMode } from "menus/types";
//import ProductForm from "../../meals/Components/ProductForm";
import MenuForm from "menus/components/MenuForm";

const ViewMenu = ({ inLine }: {inLine: boolean}) => {
    const { state } = useMenuContext();
    const menu = state.menus.find(c=>c.inViewing);

    return (
        <MenuForm
            inLine={inLine}
            menu={menu!}
            mode={FormMode.viewing}
            submitForm={() => {}}
        >
            Update Menu
        </MenuForm>
    );
}

export default ViewMenu;
