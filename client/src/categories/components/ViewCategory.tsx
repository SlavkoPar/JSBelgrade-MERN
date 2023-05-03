//import { useParams } from 'react-router-dom'
import { useState, useEffect } from "react";
import { useCategoryContext } from 'categories/CategoryProvider'

import { FormMode, ICategory } from "categories/types";
//import ProductForm from "../../questions/Components/ProductForm";
import CategoryForm from "categories/components/CategoryForm";

const ViewCategory = ({ inLine }: {inLine: boolean}) => {
    const { state } = useCategoryContext();
    const category = state.categories.find(c=>c.inViewing);

    const [formValues, setFormValues] = useState<ICategory>(category!);

    useEffect(() => {
        //category.modifiedBy_userName = category.modifiedBy_user.userName;
        setFormValues(category!);
    }, [category]);

    return (
        <CategoryForm
            inLine={inLine}
            initialValues={formValues}
            mode={FormMode.viewing}
            submitForm={() => {}}
        >
            Update Category
        </CategoryForm>
    );
}

export default ViewCategory;
