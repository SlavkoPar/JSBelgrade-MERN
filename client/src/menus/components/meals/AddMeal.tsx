import { useState } from "react";
import { useMenuContext, useMenuDispatch } from 'menus/MenuProvider'
import { useGlobalState } from 'global/GlobalProvider'

import MealForm from "menus/components/meals/MealForm";
import { ActionTypes, FormMode, IMeal } from "menus/types";

interface IProps {
    meal: IMeal,
    inLine: boolean,
    showCloseButton: boolean;
}

const AddMeal = ({ meal, inLine }: IProps) => {
    const globalState = useGlobalState();
    const { userId, wsId } = globalState.authUser;

    const dispatch = useMenuDispatch();
    const { createMeal, getAllParentMenus } = useMenuContext();
    const [formValues] = useState(meal)

    const submitForm = async (mealObject: IMeal) => {
        delete mealObject.inAdding;
        delete mealObject._id;
        const object: IMeal = {
            ...mealObject,
            wsId,
            //_id: undefined,
            created: {
                date: new Date(),
                by: {
                    userId
                }
            }
        }
        const meal = await createMeal(object);
        // on real app we can add meal from modal dlg, without knowing menu
        // if (meal) {
        //     dispatch({ type: ActionTypes.CLEAN_TREE, payload: { _id: meal.parentMenu } })
        //     await getAllParentMenus(meal.parentMenu, meal._id);
        // }
    }

    return (
        <>
            <MealForm
                initialValues={formValues}
                mode={FormMode.adding}
                submitForm={submitForm}
            >
                Create Meal
            </MealForm >
        </>
    )
}

export default AddMeal
