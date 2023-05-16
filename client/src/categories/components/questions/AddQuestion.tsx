import { useState } from "react";
import { useCategoryContext } from 'categories/CategoryProvider'
import { useGlobalState } from 'global/GlobalProvider'

import QuestionForm from "categories/components/questions/QuestionForm";
import { FormMode, IQuestion } from "categories/types";

interface IProps {
    question: IQuestion,
    inLine: boolean,
    showCloseButton: boolean;
}

const AddQuestion = ({ question, inLine }: IProps) => {
    const globalState = useGlobalState();
    const { userId, wsId } = globalState.authUser;

    const { createQuestion } = useCategoryContext();
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
        await createQuestion(object);
    }

    return (
        <>
            <QuestionForm
                question={formValues}
                mode={FormMode.adding}
                submitForm={submitForm}
            >
                Create Question
            </QuestionForm >
        </>
    )
}

export default AddQuestion
