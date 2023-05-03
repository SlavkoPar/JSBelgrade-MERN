//import { useParams } from 'react-router-dom'
import { useState, useEffect } from "react";
import { useCategoryContext } from 'categories/CategoryProvider'

import { FormMode,IQuestion } from "../../types";
import QuestionForm from "categories/components/questions/QuestionForm";

const ViewQuestion = ({ inLine }: {inLine: boolean}) => {
    const { state } = useCategoryContext();
    const category = state.categories.find(c=>c.inViewing);
    const question = category!.questions.find(q => q.inViewing)

    const [formValues, setFormValues] = useState<IQuestion>(question!);

    useEffect(() => {
        setFormValues(question!);
    }, [question]);

    return (
        <QuestionForm
            initialValues={formValues}
            mode={FormMode.viewing}
            submitForm={() => {}}
        >
            Update Question
        </QuestionForm>
    );
}

export default ViewQuestion;
