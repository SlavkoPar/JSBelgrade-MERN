//import { useParams } from 'react-router-dom'
import { useState, useEffect } from "react";
import { useMenuContext } from 'menus/MenuProvider'

import { FormMode, IMenu } from "menus/types";
//import ProductForm from "../../meals/Components/ProductForm";
import MenuForm from "menus/components/MenuForm";

const ViewMenu = ({ inLine }: {inLine: boolean}) => {
    const { state } = useMenuContext();
    const menu = state.menus.find(c=>c.inViewing);

    const [formValues, setFormValues] = useState<IMenu>(menu!);

    useEffect(() => {
        //menu.modifiedBy_userName = menu.modifiedBy_user.userName;
        setFormValues(menu!);
    }, [menu]);

    return (
        <MenuForm
            inLine={inLine}
            initialValues={formValues}
            mode={FormMode.viewing}
            submitForm={() => {}}
        >
            Update Menu
        </MenuForm>
    );
}

export default ViewMenu;
