import { useState } from "react";
import { useCategoryContext, useCategoryDispatch } from 'categories/CategoryProvider'
import { useGlobalState } from 'global/GlobalProvider'

import QuestionForm from "categories/components/questions/QuestionForm";
import { ActionTypes, FormMode, IQuestion } from "categories/types";

interface IProps {
    question: IQuestion,
    inLine: boolean,
    showCloseButton: boolean;
}

const AddQuestion = ({ question, inLine }: IProps) => {
    const globalState = useGlobalState();
    const { userId, wsId } = globalState.authUser;

    const dispatch = useCategoryDispatch();
    const { createQuestion, getAllParentCategories } = useCategoryContext();
    const [formValues] = useState(question)

    const submitForm = async (questionObject: IQuestion) => {
        delete questionObject.inAdding;
        delete questionObject._id;
        const object: IQuestion = {
            ...questionObject,
            wsId,
            //_id: undefined,
            created: {
                date: new Date(),
                by: {
                    userId
                }
            }
        }
        const question = await createQuestion(object);
        // on real app we can add question from modal dlg, without knowing category
        // if (question) {
        //     dispatch({ type: ActionTypes.CLEAN_TREE, payload: { _id: question.parentCategory } })
        //     await getAllParentCategories(question.parentCategory, question._id);
        // }
    }

    return (
        <>
            <QuestionForm
                initialValues={formValues}
                mode={FormMode.adding}
                submitForm={submitForm}
            >
                Create Question
            </QuestionForm >
        </>
    )
}

export default AddQuestion
