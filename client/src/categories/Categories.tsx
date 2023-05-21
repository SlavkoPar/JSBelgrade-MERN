import { useEffect } from 'react'
import { Container, Row, Col, Button } from "react-bootstrap";

import { useParams } from 'react-router-dom'

import { Mode, ActionTypes } from "./types";

import { useGlobalState } from "global/GlobalProvider";
import { CategoryProvider, useCategoryContext, useCategoryDispatch } from "./CategoryProvider";

import CategoryList from "categories/components/CategoryList";
import ViewCategory from "categories/components/ViewCategory";
import EditCategory from "categories/components/EditCategory";
import ViewQuestion from "categories/components/questions/ViewQuestion";
import EditQuestion from "categories/components/questions/EditQuestion";

interface IProps {
    categoryId_questionId: string | undefined
}

const Providered = ({ categoryId_questionId }: IProps) => {

    const { state, reloadCategoryNode } = useCategoryContext();
    const { lastCategoryExpanded } = state;

    const dispatch = useCategoryDispatch();

    useEffect(() => {
        (async () => {
            if (lastCategoryExpanded) {
                await reloadCategoryNode(lastCategoryExpanded, null);
            }
        })()
    }, [lastCategoryExpanded, reloadCategoryNode, categoryId_questionId])

    if (lastCategoryExpanded)
        return <div>loading...</div>

    return (
        <Container>
            <Button variant="secondary" size="sm" type="button"
                onClick={() => dispatch({
                    type: ActionTypes.ADD_SUB_CATEGORY,
                    payload: {
                        parentCategory: null,
                        level: 0
                    }
                })
                }
            >
                Add Category
            </Button>
            <Row className="my-1">
                <Col xs={12} md={7}>
                    <div>
                        <CategoryList parentCategory={null} level={1} title="root" />
                    </div>
                </Col>
                <Col xs={0} md={5}>
                    {/* {store.mode === FORM_MODES.ADD && <Add category={category??initialCategory} />} */}
                    {/* <div class="d-none d-lg-block">hide on screens smaller than lg</div> */}
                    <div id='div-details' className="d-none d-md-block">
                        {state.mode === Mode.ViewingCategory && <ViewCategory inLine={false} />}
                        {state.mode === Mode.EditingCategory && <EditCategory inLine={false} />}
                        {/* {state.mode === FORM_MODES.ADD_QUESTION && <AddQuestion category={null} />} */}
                        {state.mode === Mode.ViewingQuestion && <ViewQuestion inLine={false} />}
                        {state.mode === Mode.EditingQuestion && <EditQuestion inLine={false} />}
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

type Params = {
    categoryId_questionId: string | undefined;
};

const Categories = () => {
    let { categoryId_questionId } = useParams<Params>();

    if (categoryId_questionId && categoryId_questionId === 'null') 
        categoryId_questionId = undefined;

    if (categoryId_questionId) {
        const arr = categoryId_questionId!.split('_');
        console.assert(arr.length === 2, "expected 'categoryId-questionId'")
    }
    const globalState = useGlobalState();
    const { isAuthenticated } = globalState;

    if (!isAuthenticated)
        return <div>loading...</div>;

    return (
        <CategoryProvider>
            <Providered categoryId_questionId={categoryId_questionId} />
        </CategoryProvider>
    )
}

export default Categories;