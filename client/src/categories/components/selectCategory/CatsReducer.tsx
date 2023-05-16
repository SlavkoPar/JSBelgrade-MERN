import { Reducer } from 'react'
import { CatsActionTypes, ICategory, ICatsState, CatsActions } from "categories/types";
import { Types } from 'mongoose';

export const initialState: ICatsState = {
  loading: false,
  parentCategory: null,
  title: '',
  cats: []
}

export const CatsReducer: Reducer<ICatsState, CatsActions> = (state, action) => {
  
  switch (action.type) {
    case CatsActionTypes.SET_LOADING:
      return {
        ...state,
        loading: true
      }

    case CatsActionTypes.SET_SUB_CATS: {
      const { subCats } = action.payload;
      return {
        ...state,
        cats: state.cats.concat(subCats),
        loading: false
      }
    }

    case CatsActionTypes.SET_ERROR: {
      const { error } = action.payload;
      return { ...state, error, loading: false };
    }

    case CatsActionTypes.SET_EXPANDED: {
      const { _id, expanding } = action.payload;
      let { cats } = state;
      if (!expanding) {
        const arr = markForClean(cats, _id!)
        console.log('clean:', arr)
        const _ids = arr.map(c => c._id)
        if (_ids.length > 0) {
          cats = cats.filter(c => !_ids.includes(c._id))
        }
      }
      return {
        ...state,
        cats: state.cats.map(c => c._id === _id
          ? { ...c, isExpanded: expanding }
          : c
        )
      };
    }

    case CatsActionTypes.SET_PARENT_CATEGORY: {
      const { category } = action.payload;
      const { _id, title } = category;
      return {
        ...state,
        parentCategory: _id!,
        title
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
