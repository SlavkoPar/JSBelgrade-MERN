import { useGlobalState } from 'global/GlobalProvider'
import { createContext, useContext, useReducer, useCallback, Dispatch } from 'react';

import { Types } from 'mongoose';
import {
  ActionTypes, ICategory, IQuestion, ICategoriesContext, IParentInfo
} from 'categories/types';
import axios, { AxiosError } from "axios";
import { initialCategoriesState, CategoriesReducer } from 'categories/CategoriesReducer';

const CategoriesContext = createContext<ICategoriesContext>({} as any);
const CategoryDispatchContext = createContext<Dispatch<any>>(() => null);

type Props = {
  children: React.ReactNode
}

export const CategoryProvider: React.FC<Props> = ({ children }) => {

  const globalState = useGlobalState();
  const { wsId } = globalState.authUser;

  const [state, dispatch] = useReducer(CategoriesReducer, initialCategoriesState);
  const { parentCategories } = state;
  const { categoryIds } = parentCategories!;

  const reloadCategoryNode = useCallback(async (categoryId: string, questionId: string | null): Promise<any> => {
    try {
      const res = await axios.get(`/api/categories/get-parent-categories/${categoryId}`);
      const { status, data } = res;
      if (status === 200) {
        console.log('!!! get-parent-categories', { cId: categoryId.toString(), data })
        dispatch({
          type: ActionTypes.SET_PARENT_CATEGORIES, payload: {
            parentCategories: {
              categoryId,
              questionId, 
              categoryIds: data.map((c: { _id: string, title: string }) => c._id)
            }
          }
        })
      }
    }
    catch (err) {
      console.error(err);
    }
    return false;
  }, [dispatch]);

  const getSubCategories = useCallback(({ parentCategory, level }: IParentInfo) => {
    const url = `/api/categories/get-sub-categories/${wsId}/${parentCategory}`
    //console.log('FETCHING --->>> getSubCategories', level, parentCategory)
    //dispatch({ type: ActionTypes.SET_LOADING })
    axios
      .get(url)
      .then(({ data }) => {
        const subCategories = data.map((c: ICategory) => ({
          ...c,
          questions: [],
          isExpanded: categoryIds ? categoryIds.includes(c._id!.toString()) : false
        }))
        dispatch({ type: ActionTypes.SET_SUB_CATEGORIES, payload: { subCategories } });
      })
      .catch((error) => {
        console.log(error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error });
      });
  }, [wsId, categoryIds]);

  const getSubCats = useCallback(async ({ parentCategory, level }: IParentInfo): Promise<any> => {
    try {
      const url = `/api/categories/get-sub-categories/${wsId}/${parentCategory}`
      const res = await axios.get(url)
      const { status, data } = res;
      if (status === 200) {
        const subCats = data.map((c: ICategory) => ({
          ...c,
          questions: [],
          isExpanded: false
        }))
        return subCats;
      }
      else {
        console.log('Status is not 200', status)
        dispatch({
          type: ActionTypes.SET_ERROR,
          payload: { error: new AxiosError('Status is not 200 status:' + status) }
        });
      }
    }
    catch (err: any | AxiosError) {
      if (axios.isAxiosError(err)) {
        dispatch({
          type: ActionTypes.SET_ERROR,
          payload: {
            error: err
          }
        })
      }
      else {
        console.log(err);
      }
    }
  }, [wsId]);

  const createCategory = useCallback((category: ICategory) => {
    dispatch({ type: ActionTypes.SET_LOADING }) // TODO treba li ovo 
    axios
      .post(`/api/categories/create-category`, category)
      .then(({ status, data }) => {
        if (status === 200) {
          console.log('Category successfully created')
          dispatch({ type: ActionTypes.SET_ADDED_CATEGORY, payload: { category: { ...data, questions: [] } } });
          dispatch({ type: ActionTypes.CLOSE_CATEGORY_FORM })
        }
        else {
          console.log('Status is not 200', status)
          dispatch({
            type: ActionTypes.SET_ERROR,
            payload: {
              error: new AxiosError('Status is not 200 status:' + status)
            }
          })
        }
      })
      .catch((error) => {
        console.log(error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error });
      });
  }, []);


  const getCategory = (_id: Types.ObjectId,
    type:
      ActionTypes.VIEW_CATEGORY |
      ActionTypes.EDIT_CATEGORY |
      ActionTypes.SET_CATEGORY
  ) => {
    const url = `/api/categories/get-category/${_id}`
    // dispatch({ type: ActionTypes.SET_LOADING })
    axios
      .get(url)
      .then(({ data: category }) => {
        dispatch({ type, payload: { category } });
      })
      .catch((error) => {
        console.log(error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error });
      });
  };

  const viewCategory = useCallback((_id: Types.ObjectId) => {
    getCategory(_id, ActionTypes.VIEW_CATEGORY)
  }, []);

  const editCategory = useCallback((_id: Types.ObjectId) => {
    getCategory(_id, ActionTypes.EDIT_CATEGORY)
  }, []);

  const updateCategory = useCallback((category: ICategory) => {
    dispatch({ type: ActionTypes.SET_LOADING })
    const url = `/api/categories/update-category/${category._id}`
    axios
      .put(url, category)
      .then(({ status, data: category }) => {
        if (status === 200) {
          console.log("Category successfully updated", category);
          dispatch({ type: ActionTypes.CLEAN_SUB_TREE, payload: { category } });
          dispatch({ type: ActionTypes.SET_CATEGORY, payload: { category } });
          dispatch({ type: ActionTypes.CLOSE_CATEGORY_FORM })
        }
        else {
          console.log('Status is not 200', status)
          dispatch({
            type: ActionTypes.SET_ERROR,
            payload: { error: new AxiosError('Status is not 200 status:' + status) }
          });
        }
      })
      .catch((error) => {
        console.log(error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error });
      });
  }, []);

  const deleteCategory = (_id: Types.ObjectId) => {
    // dispatch({ type: ActionTypes.SET_LOADING })
    axios
      .delete(`/api/categories/delete-category/${_id}`)
      .then(res => {
        if (res.status === 200) {
          console.log("Category successfully deleted");
          dispatch({ type: ActionTypes.DELETE, payload: { _id } });
        }
      })
      .catch((error) => {
        console.log(error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error });
      });
  };

  /////////////
  // Questions
  //

  const getCategoryQuestions = useCallback(({ parentCategory: _id, level }: IParentInfo) => {
    getCategory(_id!, ActionTypes.SET_CATEGORY)
    //(state.mode === Mode.AddingCategory || state.mode === Mode.AddingQuestion) 
  }, []);

  
  const createQuestion = useCallback(async (question: IQuestion): Promise<any> => {
    try {
      const url = '/api/questions/create-question'
      const res = await axios.post(url, question)
      const { status, data } = res;
      if (status === 200) {
        console.log("Question successfully created");
        // TODO check setting inViewing, inEditing, inAdding to false
        dispatch({ type: ActionTypes.SET_QUESTION, payload: { question: data } });
        return data;
      }
      else {
        console.log('Status is not 200', status)
        dispatch({
          type: ActionTypes.SET_ERROR,
          payload: {
            error: new AxiosError('Status is not 200 status:' + status)
          }
        })
        return {};
      }
    }
    catch (err: any | AxiosError) {
      if (axios.isAxiosError(err)) {
        dispatch({
          type: ActionTypes.SET_ERROR,
          payload: {
            error: new AxiosError(axios.isAxiosError(err) ? err.response?.data : err)
          }
        })
      }
      else {
        console.log(err);
      }
      return {}
    }
  }, []);


  const getQuestion = (_id: Types.ObjectId, type: ActionTypes.VIEW_QUESTION | ActionTypes.EDIT_QUESTION) => {
    const url = `/api/questions/get-question/${_id}`
    //console.log(`FETCHING --->>> ${url}`)
    // dispatch({ type: ActionTypes.SET_LOADING })
    axios
      .get(url)
      .then(({ data }) => {
        const question: IQuestion = data;
        dispatch({ type, payload: { question } });
      })
      .catch((error) => {
        console.log(error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error });
      });
  };

  const viewQuestion = useCallback((_id: Types.ObjectId) => {
    getQuestion(_id, ActionTypes.VIEW_QUESTION);
  }, []);

  const editQuestion = useCallback((_id: Types.ObjectId) => {
    getQuestion(_id, ActionTypes.EDIT_QUESTION);
  }, []);

  const updateQuestion = useCallback(async (question: IQuestion): Promise<any> => {
    try {
      const url = `/api/questions/update-question/${question._id}`
      const res = await axios.put(url, question)
      const { status, data } = res;
      if (status === 200) {
        // TODO check setting inViewing, inEditing, inAdding to false
        console.log("Question successfully updated");
        dispatch({ type: ActionTypes.SET_QUESTION, payload: { question: data } });
        return data;
      }
      else {
        console.log('Status is not 200', status)
        dispatch({
          type: ActionTypes.SET_ERROR,
          payload: {
            error: new AxiosError('Status is not 200 status:' + status)
          }
        })
        return {};
      }
    }
    catch (err: any | AxiosError) {
      if (axios.isAxiosError(err)) {
        dispatch({
          type: ActionTypes.SET_ERROR,
          payload: {
            error: new AxiosError(axios.isAxiosError(err) ? err.response?.data : err)
          }
        })
        return {};
      }
      else {
        console.log(err);
      }
      return {}
    }
  }, []);

  const deleteQuestion = (_id: Types.ObjectId) => {
    // dispatch({ type: ActionTypes.SET_LOADING })
    axios
      .delete(`/api/questions/delete-question/${_id}`)
      .then(res => {
        if (res.status === 200) {
          console.log("Question successfully deleted");
          dispatch({ type: ActionTypes.DELETE_QUESTION, payload: { question: res.data.question } });
        }
      })
      .catch((error) => {
        console.log(error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error });
      });
  };

  const contextValue: ICategoriesContext = {
    state,
    reloadCategoryNode: reloadCategoryNode,
    getSubCategories, getSubCats, createCategory, viewCategory, editCategory, updateCategory, deleteCategory,
    getCategoryQuestions, createQuestion, viewQuestion, editQuestion, updateQuestion, deleteQuestion
  }
  return (
    <CategoriesContext.Provider value={contextValue}>
      <CategoryDispatchContext.Provider value={dispatch}>
        {children}
      </CategoryDispatchContext.Provider>
    </CategoriesContext.Provider>
  );
}

export function useCategoryContext() {
  return useContext(CategoriesContext);
}

export const useCategoryDispatch = () => {
  return useContext(CategoryDispatchContext)
};

