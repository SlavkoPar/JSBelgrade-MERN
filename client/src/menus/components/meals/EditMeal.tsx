import { useMenuContext } from 'menus/MenuProvider'
import { useGlobalState } from 'global/GlobalProvider'

import MealForm from "menus/components/meals/MealForm";
import { FormMode, IMeal } from "menus/types";

const EditMeal = ({ inLine }: {inLine: boolean}) => {
    const globalState = useGlobalState();
    const { state, updateMeal } = useMenuContext();
    const menu = state.menus.find(c=>c.inEditing);
    const meal = menu!.meals.find(q => q.inEditing)
    
    const submitForm = (mealObject: IMeal) => {
        const object: IMeal = {
            ...mealObject,
            modified: {
                date: new Date(),
                by: {
                    userId: globalState.authUser.userId
                }
            }
        }
        updateMeal(object)
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
