import { useMenuContext } from 'menus/MenuProvider'
import { useGlobalState } from 'global/GlobalProvider'

import MenuForm from "menus/components/MenuForm";
import { FormMode, IMenu } from "menus/types";

const EditMenu = ({ inLine }: {inLine: boolean}) => {
    const globalState = useGlobalState();
    const { state, updateMenu } = useMenuContext();
    const menu = state.menus.find(c=>c.inEditing);

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

    return (
        <MenuForm
            inLine={inLine}
            menu={menu!}
            mode={FormMode.editing}
            submitForm={submitForm}
        >
            Update Menu
        </MenuForm>
    );
};

export default EditMenu;
