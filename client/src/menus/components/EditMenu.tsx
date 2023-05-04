//import { useParams } from 'react-router-dom'
import { useState, useEffect } from "react";
import { useMenuContext } from 'menus/MenuProvider'
import { useGlobalState } from 'global/GlobalProvider'

import MenuForm from "menus/components/MenuForm";
import { FormMode, IMenu } from "menus/types";

const EditMenu = ({ inLine }: {inLine: boolean}) => {
    const globalState = useGlobalState();
    const { state, updateMenu } = useMenuContext();
    const menu = state.menus.find(c=>c.inEditing);

    const [formValues, setFormValues] = useState<IMenu>(menu!);

    const submitForm = (menuObject: IMenu) => {
        const object: IMenu = {
            ...menuObject,
            modified: {
                date: new Date(),
                by: {
                    userId: globalState.authUser.userId
                }
            }
        }
        updateMenu(object)
    };

    useEffect(() => {
        //menu.modifiedBy_userName = menu.modifiedBy_user.userName;
        setFormValues(menu!);
    }, [menu]);

    return (
        <MenuForm
            inLine={inLine}
            initialValues={formValues}
            mode={FormMode.editing}
            submitForm={submitForm}
        >
            Update Menu
        </MenuForm>
    );
};

export default EditMenu;
