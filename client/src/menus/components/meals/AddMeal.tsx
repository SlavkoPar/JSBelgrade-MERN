import { useState } from "react";
import { useMenuContext } from 'menus/MenuProvider'
import { useGlobalState } from 'global/GlobalProvider'

import MealForm from "menus/components/meals/MealForm";
import { FormMode, IMeal } from "../../types";

// const Add = ({ menu, meal, inLine } : { menu: IMenu, meal: IMeal, inLine: boolean}) => {
const AddMeal = ({ meal, inLine } : { meal: IMeal, inLine: boolean }) => { //{ menu }: { menu: IMenu }) => {
    const globalState = useGlobalState();
    const { userId, wsId } = globalState.authUser;

    const { createMeal } = useMenuContext();
    const [formValues] = useState(meal)

    const submitForm = (mealObject: IMeal) => {
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
        createMeal(object);
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
