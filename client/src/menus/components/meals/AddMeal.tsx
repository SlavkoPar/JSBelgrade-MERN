import { useState } from "react";
import { useMenuContext } from 'menus/MenuProvider'
import { useGlobalState } from 'global/GlobalProvider'

import MealForm from "menus/components/meals/MealForm";
import { FormMode, IMeal } from "menus/types";

interface IProps {
    meal: IMeal,
    inLine: boolean,
    showCloseButton: boolean;
}

const AddMeal = ({ meal, inLine }: IProps) => {
    const globalState = useGlobalState();
    const { userId, wsId } = globalState.authUser;

    const { createMeal } = useMenuContext();
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
        await createMeal(object);
    }

    return (
        <>
            <MealForm
                meal={formValues}
                mode={FormMode.adding}
                submitForm={submitForm}
            >
                Create Meal
            </MealForm >
        </>
    )
}

export default AddMeal
