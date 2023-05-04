import { useState } from "react";
import { useMenuContext } from 'menus/MenuProvider'
import { useGlobalState } from 'global/GlobalProvider'

import MenuForm from "menus/components/MenuForm";
import InLineMenuForm from "menus/components/InLineMenuForm";
import { FormMode, IMenu } from "menus/types";

const AddMenu = ({ menu, inLine } : { menu: IMenu, inLine: boolean}) => {
    const globalState = useGlobalState();
    const { userId, wsId } = globalState.authUser;
    const { createMenu } = useMenuContext();
    const [formValues] = useState(menu)

    const submitForm = (menuObject: IMenu) => {
        delete menuObject.inAdding;
        const object: IMenu = {
            ...menuObject,
            _id: undefined,
            wsId, 
            created: {
                date: new Date(),
                by: {
                    userId
                }
            }
        }
        createMenu(object);
    }

    return (
        <>
            {inLine ?
                <InLineMenuForm
                    inLine={true}
                    initialValues={formValues}
                    mode={FormMode.adding}
                    submitForm={submitForm}
                >
                    Create
                </InLineMenuForm>
                :
                <MenuForm
                    inLine={false}
                    initialValues={formValues}
                    mode={FormMode.adding}
                    submitForm={submitForm}
                >
                    Create Menu
                </MenuForm >
            }
        </>
    )
}

export default AddMenu
