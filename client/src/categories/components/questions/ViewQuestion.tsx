import { useCategoryContext } from 'categories/CategoryProvider'

import { FormMode, } from "../../types";
import QuestionForm from "categories/components/questions/QuestionForm";

const ViewQuestion = ({ inLine }: {inLine: boolean}) => {
    const { state } = useCategoryContext();
    const category = state.categories.find(c=>c.inViewing);
    const question = category!.questions.find(q => q.inViewing)

    return (
        <QuestionForm
            initialValues={question!}
            mode={FormMode.viewing}
            submitForm={() => {}}
        >
            Update Question
        </QuestionForm>
    );
}

export default ViewQuestion;
