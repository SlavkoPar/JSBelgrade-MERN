//import { useParams } from 'react-router-dom'
import { useState, useEffect } from "react";
import { useCategoryContext } from 'categories/CategoryProvider'
import { useGlobalState } from 'global/GlobalProvider'

import CategoryForm from "categories/components/CategoryForm";
import { FormMode, ICategory } from "categories/types";

const EditCategory = ({ inLine }: {inLine: boolean}) => {
    const globalState = useGlobalState();
    const { state, updateCategory } = useCategoryContext();
    const category = state.categories.find(c=>c.inEditing);

    const [formValues, setFormValues] = useState<ICategory>(category!);

    const submitForm = (categoryObject: ICategory) => {
        const object: ICategory = {
            ...categoryObject,
            modified: {
                date: new Date(),
                by: {
                    userId: globalState.authUser.userId
                }
            }
        }
        updateCategory(object)
    };

    useEffect(() => {
        //category.modifiedBy_userName = category.modifiedBy_user.userName;
        setFormValues(category!);
    }, [category]);

    return (
        <CategoryForm
            inLine={inLine}
            initialValues={formValues}
            mode={FormMode.editing}
            submitForm={submitForm}
        >
            Update Category
        </CategoryForm>
    );
};

export default EditCategory;
