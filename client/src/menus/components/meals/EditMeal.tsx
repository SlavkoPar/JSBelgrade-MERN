import { useState, useEffect } from "react";
import { useMenuContext } from 'menus/MenuProvider'
import { useGlobalState } from 'global/GlobalProvider'

import MealForm from "menus/components/meals/MealForm";
import { FormMode, IMeal } from "menus/types";
import { initialMeal } from "menus/MenusReducer";

const EditMeal = ({ inLine }: {inLine: boolean}) => {
    const globalState = useGlobalState();
    const { state, updateMeal } = useMenuContext();
    const menu = state.menus.find(c=>c.inEditing);
    const meal = menu!.meals.find(q => q.inEditing)
    
    const [formValues, setFormValues] = useState<IMeal>(meal??initialMeal);

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

    useEffect(() => {
        setFormValues(meal!);
    }, [meal]);

    return (
        <MealForm
            initialValues={formValues}
            mode={FormMode.editing}
            submitForm={submitForm}
        >
            Update Meal
        </MealForm>
    );
};

export default EditMeal;
