import { useMenuContext } from 'menus/MenuProvider'

import { FormMode, } from "../../types";
import MealForm from "menus/components/meals/MealForm";

const ViewMeal = ({ inLine }: {inLine: boolean}) => {
    const { state } = useMenuContext();
    const menu = state.menus.find(c=>c.inViewing);
    const meal = menu!.meals.find(q => q.inViewing)

    return (
        <MealForm
            initialValues={meal!}
            mode={FormMode.viewing}
            submitForm={() => {}}
        >
            Update Meal
        </MealForm>
    );
}

export default ViewMeal;
