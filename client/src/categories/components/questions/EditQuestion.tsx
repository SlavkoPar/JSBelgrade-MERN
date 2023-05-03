import { useState, useEffect } from "react";
import { useCategoryContext } from 'categories/CategoryProvider'
import { useGlobalState } from 'global/GlobalProvider'

import QuestionForm from "categories/components/questions/QuestionForm";
import { FormMode, IQuestion } from "categories/types";
import { initialQuestion } from "categories/CategoriesReducer";

const EditQuestion = ({ inLine }: {inLine: boolean}) => {
    const globalState = useGlobalState();
    const { state, updateQuestion } = useCategoryContext();
    const category = state.categories.find(c=>c.inEditing);
    const question = category!.questions.find(q => q.inEditing)
    
    const [formValues, setFormValues] = useState<IQuestion>(question??initialQuestion);

    const submitForm = (questionObject: IQuestion) => {
        const object: IQuestion = {
            ...questionObject,
            modified: {
                date: new Date(),
                by: {
                    userId: globalState.authUser.userId
                }
            }
        }
        updateQuestion(object)
    };

    useEffect(() => {
        setFormValues(question!);
    }, [question]);

    return (
        <QuestionForm
            initialValues={formValues}
            mode={FormMode.editing}
            submitForm={submitForm}
        >
            Update Question
        </QuestionForm>
    );
};

export default EditQuestion;
