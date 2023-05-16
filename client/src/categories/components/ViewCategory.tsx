import { useCategoryContext } from 'categories/CategoryProvider'

import { FormMode } from "categories/types";
//import ProductForm from "../../questions/Components/ProductForm";
import CategoryForm from "categories/components/CategoryForm";

const ViewCategory = ({ inLine }: {inLine: boolean}) => {
    const { state } = useCategoryContext();
    const category = state.categories.find(c=>c.inViewing);

    return (
        <CategoryForm
            inLine={inLine}
            category={category!}
            mode={FormMode.viewing}
            submitForm={() => {}}
        >
            Update Category
        </CategoryForm>
    );
}

export default ViewCategory;
