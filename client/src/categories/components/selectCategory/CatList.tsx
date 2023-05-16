import { useEffect, useReducer } from "react";
import { ListGroup } from "react-bootstrap";
import CatRow from "categories/components/selectCategory/CatRow";
import { CatsActionTypes, ICatInfo, ICategory } from "categories/types";
import { useCategoryContext } from "categories/CategoryProvider";
import { CatsReducer, initialState } from "./CatsReducer";

const CatList = ({ parentCategory, level, setParentCategory }: ICatInfo) => {
    const [state, dispatch] = useReducer(CatsReducer, initialState);
    const { getSubCats } = useCategoryContext();
    useEffect(() => {
        (async () => {
            const subCats = await getSubCats({ parentCategory, level });
            console.log('getSubCats', parentCategory, level, subCats);
            dispatch({ type: CatsActionTypes.SET_SUB_CATS, payload: { subCats } });
        })()
    }, [getSubCats, parentCategory, level]);

    const mySubCategories = state.cats.filter(c => c.parentCategory === parentCategory);

    const setParentCat = (cat: ICategory) => {
        dispatch({ type: CatsActionTypes.SET_PARENT_CATEGORY, payload: { category: cat } })
        setParentCategory!(cat);
    }

    return (
        <div className={level > 1 ? 'ms-4' : ''}>
            <>
                <ListGroup as="ul" variant='dark' className="mb-0">
                    {mySubCategories.map(category =>
                        <CatRow
                            category={category}
                            dispatch={dispatch}
                            setParentCategory={setParentCat}
                            key={category._id!.toString()}
                        />
                    )
                    }
                </ListGroup>

                {state.error && state.error}
            </>
        </div>
    );
};

export default CatList;
