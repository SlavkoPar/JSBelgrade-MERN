//import { useParams } from 'react-router-dom'
import { useState, useEffect } from "react";
import { useMenuContext } from 'menus/MenuProvider'

import { FormMode,IMeal } from "../../types";
import MealForm from "menus/components/meals/MealForm";

const ViewMeal = ({ inLine }: {inLine: boolean}) => {
    const { state } = useMenuContext();
    const menu = state.menus.find(c=>c.inViewing);
    const meal = menu!.meals.find(q => q.inViewing)

    const [formValues, setFormValues] = useState<IMeal>(meal!);

    useEffect(() => {
        setFormValues(meal!);
    }, [meal]);

    return (
        <MealForm
            initialValues={formValues}
            mode={FormMode.viewing}
            submitForm={() => {}}
        >
            Update Meal
        </MealForm>
    );
}

export default ViewMeal;
