import { useMenuContext, useMenuDispatch } from 'menus/MenuProvider'
import { useGlobalState } from 'global/GlobalProvider'

import MealForm from "menus/components/meals/MealForm";
import { ActionTypes, FormMode, IMeal } from "menus/types";

const EditMeal = ({ inLine }: {inLine: boolean}) => {
    const globalState = useGlobalState();
    const dispatch = useMenuDispatch();
    const { state, updateMeal, getAllParentMenus } = useMenuContext();
    const menu = state.menus.find(c=>c.inEditing);
    const meal = menu!.meals.find(q => q.inEditing)
    
    const submitForm = async (mealObject: IMeal) => {
        const object: IMeal = {
            ...mealObject,
            modified: {
                date: new Date(),
                by: {
                    userId: globalState.authUser.userId
                }
            }
        }
        const q = await updateMeal(object)
        if (meal!.parentMenu !== q.parentMenu) {
            dispatch({ type: ActionTypes.CLEAN_TREE, payload: { _id: q.parentMenu } })
            await getAllParentMenus(q.parentMenu, q._id);
        }
    };

    return (
        <MealForm
            initialValues={meal!}
            mode={FormMode.editing}
            submitForm={submitForm}
        >
            Update Meal
        </MealForm>
    );
};

export default EditMeal;
