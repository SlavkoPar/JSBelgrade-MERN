import { Reducer } from 'react'
import { Mode, ActionTypes, ICategoriesState, ICategory, IQuestion, CategoriesActions } from "categories/types";
import { Types } from 'mongoose';

export const initialQuestion: IQuestion = {
  // temp _id for inAdding, to server as list key
  // it will be removed on submitForm
  // real _id will be given by the MongoDB 
  wsId: new Types.ObjectId("000000000000000000000000"),
  parentCategory: new Types.ObjectId('000000000000000000000000'),
  _id: new Types.ObjectId('000000000000000000000000'),
  title: '',
  level: 0,
  source: 0,
  status: 0
}

export const initialCategory: ICategory = {
  // temp _id for inAdding, to server as list key
  // it will be removed on submitForm
  // real _id will be given by the MongoDB 
  wsId: new Types.ObjectId("000000000000000000000000"),
  _id: new Types.ObjectId("000000000000000000000000"),
  title: '',
  level: 0,
  parentCategory: null,
  questions: [],
  isExpanded: false
}

export const initialState: ICategoriesState = {
  mode: Mode.NULL,
  loading: false,
  categories: [],
  currentCategoryExpanded: '',
  lastCategoryExpanded: null,
  parentCategories: {
    categoryId: null,
    questionId: null,
    categoryIds: null
  }
}

let initialStateFromLocalStorage: ICategoriesState | undefined;

const hasMissingProps = (): boolean => {
  let b = false;
  const keys = Object.keys(initialStateFromLocalStorage!)
  Object.keys(initialState).forEach((prop: string) => {
    if (!keys.includes(prop)) {
      b = true;
      console.log('missing prop:', prop, ' try with SignOut')
    }
  })
  return b;
}

if ('localStorage' in window) {
  const s = localStorage.getItem('CATEGORIES_STATE');
  if (s !== null) {
    initialStateFromLocalStorage = JSON.parse(s);
    if (hasMissingProps()) {
      initialStateFromLocalStorage = undefined;
    }
    else {
      const { currentCategoryExpanded, parentCategories } = initialStateFromLocalStorage!;
      initialStateFromLocalStorage = {
        ...initialStateFromLocalStorage!,
        lastCategoryExpanded: currentCategoryExpanded,
        parentCategories
      }
      console.log('categories initialState FromLocalStorage', { initialStateFromLocalStorage });
    }
  }
}

export const initialCategoriesState: ICategoriesState = initialStateFromLocalStorage
  ? initialStateFromLocalStorage
  : initialState

export const CategoriesReducer: Reducer<ICategoriesState, CategoriesActions> = (state, action) => {
  const newState = reducer(state, action);
  const aTypesToStore = [
    ActionTypes.SET_EXPANDED
  ];
  if (aTypesToStore.includes(action.type)) {
    const value = JSON.stringify({
      ...initialState,
      currentCategoryExpanded: newState.currentCategoryExpanded
    })
    localStorage.setItem('CATEGORIES_STATE', value);
  }
  return newState;
}

const reducer = (state: ICategoriesState, action: CategoriesActions) => {
  switch (action.type) {

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: true
      }

    case ActionTypes.SET_PARENT_CATEGORIES: {
      const { parentCategories } = action.payload;
      console.log("SET_PARENT_CATEGORIES", parentCategories)
      return {
        ...state,
        parentCategories,
        lastCategoryExpanded: null
      };
    }

    case ActionTypes.SET_SUB_CATEGORIES: {
      const { subCategories } = action.payload;
      const categories = state.categories.concat(subCategories);
      return {
        ...state,
        categories,
        loading: false
      };
    }

    case ActionTypes.CLEAN_SUB_TREE: {
      const { _id } = action.payload.category;
      const arr = markForClean(state.categories, _id!)
      console.log('clean:', arr)
      const _ids = arr.map(c => c._id)
      if (arr.length === 0)
        return {
          ...state
        }
      else
        return {
          ...state,
          categories: state.categories.filter(c => !_ids.includes(c._id))
        }
    }

    case ActionTypes.SET_ERROR: {
      const { error } = action.payload;
      return { ...state, error, loading: false };
    }

    case ActionTypes.ADD_SUB_CATEGORY: {
      const { parentCategory, level } = action.payload;
      const category: ICategory = {
        ...initialCategory,
        title: '',
        level: level + 1,
        parentCategory,
        inAdding: true
      }
      return {
        ...state,
        categories: [category, ...state.categories],
        mode: Mode.AddingCategory
      };
    }

    case ActionTypes.SET_ADDED_CATEGORY: {
      const { category } = action.payload;
      // category doesn't contain inViewving, inEditing, inAdding 
      return {
        ...state,
        categories: state.categories.map(c => c.inAdding ? category : c),
        mode: Mode.NULL,
        loading: false
      }
    }

    case ActionTypes.SET_CATEGORY: {
      const { category } = action.payload; // category doesn't contain inViewing, inEditing, inAdding 
      const { questions } = category;
      const cat = state.categories.find(c => c._id === category._id);
      const questionInAdding = cat!.questions.find(q => q.inAdding);
      if (questionInAdding) {
        questions.unshift(questionInAdding);
        console.assert(state.mode === Mode.AddingQuestion, "expected Mode.AddingQuestion")
      }
      return {
        ...state,
        categories: state.categories.map(c => c._id === category._id
          ? { ...category, questions, inAdding: c.inAdding, isExpanded: c.isExpanded }
          : c),
        // keep mode
        loading: false
      }
    }

    case ActionTypes.VIEW_CATEGORY: {
      const { category } = action.payload;
      return {
        ...state,
        categories: state.categories.map(c => c._id === category._id
          ? { ...category, inViewing: true, isExpanded: c.isExpanded } // category.questions are inside of object
          : { ...c, inViewing: false }
        ),
        mode: Mode.ViewingCategory,
        loading: false
      };
    }

    case ActionTypes.EDIT_CATEGORY: {
      const { category } = action.payload;
      return {
        ...state,
        categories: state.categories.map(c => c._id === category._id
          ? { ...category, inEditing: true, isExpanded: c.isExpanded }
          : c
        ),
        mode: Mode.EditingCategory,
        loading: false
      };
    }

    case ActionTypes.DELETE: {
      const { _id } = action.payload;
      return {
        ...state,
        mode: Mode.NULL,
        categories: state.categories.filter(c => c._id !== _id)
      };
    }

    case ActionTypes.CANCEL_CATEGORY_FORM:
    case ActionTypes.CLOSE_CATEGORY_FORM: {
      const categories = state.mode === Mode.AddingCategory
        ? state.categories.filter(c => !c.inAdding)
        : state.categories
      return {
        ...state,
        mode: Mode.NULL,
        categories: categories.map(c => ({ ...c, inViewing: false, inEditing: false, inAdding: false }))
      };
    }

    case ActionTypes.SET_EXPANDED: {
      const { _id, expanding } = action.payload;
      return {
        ...state,
        categories: state.categories.map(c => c._id === _id
          ? { ...c, isExpanded: expanding }
          : c
        ),
        currentCategoryExpanded: expanding ? _id.toString() : state.currentCategoryExpanded
      };
    }

    // First we add a new question to the category.guestions
    // After user clicks Save, we call createQuestion 
    case ActionTypes.ADD_QUESTION: {
      const { categoryInfo } = action.payload;
      const { _id, level } = categoryInfo;
      const question: IQuestion = {
        ...initialQuestion,
        parentCategory: _id,
        level,
        inAdding: true
      }
      return {
        ...state,
        categories: state.categories.map(c => c._id === _id
          ? { ...c, questions: [question, ...c.questions], inAdding: true }
          : { ...c, inAdding: false }),
        mode: Mode.AddingQuestion
      };
    }

    case ActionTypes.VIEW_QUESTION: {
      const { question } = action.payload;
      return {
        ...state,
        categories: state.categories.map(c => c._id === question.parentCategory
          ? {
            ...c,
            questions: c.questions.map(q => q._id === question._id ? {
              ...question,
              inViewing: true
            }
              : {
                ...q,
                inViewing: false
              }),
            inViewing: true
          }
          : {
            ...c,
            inViewing: false
          }
        ),
        mode: Mode.ViewingQuestion,
        loading: false
      }
    }

    case ActionTypes.SET_QUESTION: {
      const { question } = action.payload;
      const { parentCategory, _id } = question;
      const inAdding = state.mode === Mode.AddingQuestion;

      // for inAdding, _id is Types.ObjectId('000000000000000000000000')
      // thats why we look for q.inAdding instead of q._id === _id
      const categories = state.categories.map(c => c._id === parentCategory
        ? {
          ...c,
          questions: inAdding
            ? c.questions.map(q => q.inAdding ? question : q)
            : c.questions.map(q => q._id === _id ? question : q),
          inViewing: false,
          inEditing: false,
          inAdding: false
        }
        : c
      );
      return {
        ...state,
        categories,
        mode: Mode.NULL,
        loading: false
      };
    }


    case ActionTypes.EDIT_QUESTION: {
      const { question } = action.payload;
      return {
        ...state,
        categories: state.categories.map(c => c._id === question.parentCategory
          ? {
            ...c,
            questions: c.questions.map(q => q._id === question._id ? {
              ...question,
              inEditing: true
            }
              : {
                ...q,
                inEditing: false
              }),
            inEditing: true
          }
          : {
            ...c,
            inEditing: false
          }
        ),
        mode: Mode.EditingQuestion,
        loading: false
      };
    }

    case ActionTypes.DELETE_QUESTION: {
      const { question } = action.payload;
      const { _id, parentCategory } = question;
      return {
        ...state,
        categories: state.categories.map(c => c._id === parentCategory
          ? {
            ...c,
            questions: c.questions.filter(q => q._id !== _id)
          }
          : c
        ),
        mode: Mode.NULL
      }
    }

    case ActionTypes.CANCEL_QUESTION_FORM:
    case ActionTypes.CLOSE_QUESTION_FORM: {
      const { question } = action.payload;
      const category = state.categories.find(c => c._id === question.parentCategory)
      let questions: IQuestion[] = [];
      switch (state.mode) {
        case Mode.AddingQuestion: {
          console.assert(category!.inAdding, "expected category.inAdding");
          questions = category!.questions.filter(q => !q.inAdding)
          break;
        }

        case Mode.ViewingQuestion: {
          console.assert(category!.inViewing, "expected category.inViewing");
          questions = category!.questions.map(q => ({ ...q, inViewing: false }))
          break;
        }

        case Mode.EditingQuestion: {
          console.assert(category!.inEditing, "expected category.inEditing");
          questions = category!.questions.map(q => ({ ...q, inEditing: false }))
          break;
        }

        default:
          break;
      }

      return {
        ...state,
        categories: state.categories.map(c => c._id === question.parentCategory
          ? { ...c, questions, inAdding: false, inEditing: false, inViewing: false }
          : c
        ),
        mode: Mode.NULL,
      };
    }

    default:
      return state;  // TODO throw error
  }
};

function markForClean(categories: ICategory[], parentCategory: Types.ObjectId) {
  let deca = categories
    .filter(c => c.parentCategory === parentCategory)
    .map(c => ({ _id: c._id, parentCategory: c.parentCategory }))

  deca.forEach(c => {
    deca = deca.concat(markForClean(categories, c._id!))
  })
  return deca
}
