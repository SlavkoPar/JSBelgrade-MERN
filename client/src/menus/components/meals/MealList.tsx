import { useEffect } from "react";
import { ListGroup } from "react-bootstrap";
import MealRow from "menus/components/meals/MealRow";
import { IMeal, IParentInfo } from "menus/types";
import { useMenuContext } from "menus/MenuProvider";
import { Types } from "mongoose";

const MealList = ({ title, parentMenu, level }: IParentInfo) => {
    const { state, getMenuMeals, viewMeal } = useMenuContext();
    const { parentMenus } = state;
    const { menuId, mealId } = parentMenus!;

    useEffect(() => {
        console.log('getMenuMeals', title, level)
        getMenuMeals({ parentMenu, level });
    }, [level, getMenuMeals, parentMenu, title]);

    useEffect(() => {
        if (menuId != null) {
            if (menuId === parentMenu!.toString() && mealId) {
                setTimeout(() => {
                    viewMeal(new Types.ObjectId(mealId))
                }, 3000)
            }
        }
    }, [viewMeal, parentMenu, menuId, mealId]);


    // console.log('level, parentMenu:', level, parentMenu)
    const menu = state.menus.find(c => c._id === parentMenu);
    const { meals } = menu!;

    // console.log('MealList render', meals, level)

    return (
        <div className={`ms-0`}>
            <>
                <ListGroup as="ul" variant='dark' className={level > 1 ? 'mb-0 ms-4' : 'mb-0'}>
                    {meals.map((meal: IMeal) =>
                        <MealRow
                            meal={meal}
                            menuInAdding={menu!.inAdding}
                            key={meal._id!.toString()}
                        />)
                        // menu={cat}
                    }
                </ListGroup>

                {state.error && state.error}
                {/* {state.loading && <div>...loading</div>} */}
            </>
        </div>
    );
};

export default MealList;
