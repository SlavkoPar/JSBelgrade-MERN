import { Reducer } from 'react'
import { Mode, ActionTypes, IMenusState, IMenu, IMeal, MenusActions } from "menus/types";
import { Types } from 'mongoose';

export const initialMeal: IMeal = {
  // temp _id for inAdding, to server as list key
  // it will be removed on submitForm
  // real _id will be given by the MongoDB 
  wsId: new Types.ObjectId("000000000000000000000000"),
  parentMenu: new Types.ObjectId('000000000000000000000000'),
  _id: new Types.ObjectId('000000000000000000000000'),
  title: '',
  level: 0,
  source: 0,
  status: 0
}

export const initialMenu: IMenu = {
  // temp _id for inAdding, to server as list key
  // it will be removed on submitForm
  // real _id will be given by the MongoDB 
  wsId: new Types.ObjectId("000000000000000000000000"),
  _id: new Types.ObjectId("000000000000000000000000"),
  title: '',
  level: 0,
  parentMenu: null,
  meals: [],
  isExpanded: false
}

export const initialState: IMenusState = {
  mode: Mode.NULL,
  loading: false,
  menus: [],
  currentMenuExpanded: '',
  lastMenuExpanded: null,
  menuId_mealId_done: null,
  parentMenus: {
    menuId: null,
    mealId: null,
    menuIds: null
  }
}

let initialStateFromLocalStorage: IMenusState | undefined;

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
  const s = localStorage.getItem('MENUS_STATE');
  if (s !== null) {
    initialStateFromLocalStorage = JSON.parse(s);
    if (hasMissingProps()) {
      initialStateFromLocalStorage = undefined;
    }
    else {
      const { currentMenuExpanded, parentMenus } = initialStateFromLocalStorage!;
      initialStateFromLocalStorage = {
        ...initialStateFromLocalStorage!,
        lastMenuExpanded: currentMenuExpanded,
        parentMenus
      }
      console.log('menus initialState FromLocalStorage', { initialStateFromLocalStorage });
    }
  }
}

export const initialMenusState: IMenusState = initialStateFromLocalStorage
  ? initialStateFromLocalStorage
  : initialState

export const MenusReducer: Reducer<IMenusState, MenusActions> = (state, action) => {
  const newState = reducer(state, action);
  const aTypesToStore = [
    ActionTypes.TOGGLE_EXPANDED
  ];
  if (aTypesToStore.includes(action.type)) {
    const value = JSON.stringify({
      ...initialState,
      currentMenuExpanded: newState.currentMenuExpanded
    })
    localStorage.setItem('MENUS_STATE', value);
  }
  return newState;
}

const reducer = (state: IMenusState, action: MenusActions) => {
  switch (action.type) {

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: true
      }

    case ActionTypes.SET_PARENT_MENUS: {
      const { parentMenus } = action.payload;
      console.log("SET_PARENT_MENUS", parentMenus)
      return {
        ...state,
        parentMenus,
        lastMenuExpanded: null,
        menuId_mealId_done: `${parentMenus.menuId}_${parentMenus.mealId}`,
      };
    }

    case ActionTypes.SET_SUB_MENUS: {
      const { subMenus } = action.payload;
      const menus = state.menus.concat(subMenus);
      return {
        ...state,
        menus,
        loading: false
      };
    }

    case ActionTypes.CLEAN_SUB_TREE: {
      const { _id } = action.payload.menu;
      const arr = markForClean(state.menus, _id!)
      console.log('clean:', arr)
      const _ids = arr.map(c => c._id)
      if (arr.length === 0)
        return {
          ...state
        }
      else
        return {
          ...state,
          menus: state.menus.filter(c => !_ids.includes(c._id))
        }
    }

    case ActionTypes.SET_ERROR: {
      const { error } = action.payload;
      return { ...state, error, loading: false };
    }

    case ActionTypes.ADD_SUB_MENU: {
      const { parentMenu, level } = action.payload;
      const menu: IMenu = {
        ...initialMenu,
        title: '',
        level: level + 1,
        parentMenu,
        inAdding: true
      }
      return {
        ...state,
        menus: [menu, ...state.menus],
        mode: Mode.AddingMenu
      };
    }

    case ActionTypes.SET_ADDED_MENU: {
      const { menu } = action.payload;
      // menu doesn't contain inViewving, inEditing, inAdding 
      return {
        ...state,
        menus: state.menus.map(c => c.inAdding ? menu : c),
        mode: Mode.NULL,
        loading: false
      }
    }

    case ActionTypes.SET_MENU: {
      const { menu } = action.payload; // menu doesn't contain inViewing, inEditing, inAdding 
      const { meals } = menu;
      const cat = state.menus.find(c => c._id === menu._id);
      const mealInAdding = cat!.meals.find(q => q.inAdding);
      if (mealInAdding) {
        meals.unshift(mealInAdding);
        console.assert(state.mode === Mode.AddingMeal, "expected Mode.AddingMeal")
      }
      return {
        ...state,
        menus: state.menus.map(c => c._id === menu._id
          ? { ...menu, meals, inAdding: c.inAdding, isExpanded: c.isExpanded }
          : c),
        // keep mode
        loading: false
      }
    }

    case ActionTypes.VIEW_MENU: {
      const { menu } = action.payload;
      return {
        ...state,
        menus: state.menus.map(c => c._id === menu._id
          ? { ...menu, inViewing: true } // menu.meals are inside of object
          : { ...c, inViewing: false }
        ),
        mode: Mode.ViewingMenu,
        loading: false
      };
    }

    case ActionTypes.EDIT_MENU: {
      const { menu } = action.payload;
      return {
        ...state,
        menus: state.menus.map(c => c._id === menu._id
          ? { ...menu, inEditing: true }
          : c
        ),
        mode: Mode.EditingMenu,
        loading: false
      };
    }

    case ActionTypes.DELETE: {
      const { _id } = action.payload;
      return {
        ...state,
        mode: Mode.NULL,
        menus: state.menus.filter(c => c._id !== _id)
      };
    }

    case ActionTypes.CANCEL_MENU_FORM:
    case ActionTypes.CLOSE_MENU_FORM: {
      const menus = state.mode === Mode.AddingMenu
        ? state.menus.filter(c => !c.inAdding)
        : state.menus
      return {
        ...state,
        mode: Mode.NULL,
        menus: menus.map(c => ({ ...c, inViewing: false, inEditing: false, inAdding: false }))
      };
    }

    case ActionTypes.TOGGLE_EXPANDED: {
      const { _id, expanding } = action.payload;
      return {
        ...state,
        menus: state.menus.map(c => c._id === _id
          ? { ...c, isExpanded: expanding }
          : c
        ),
        currentMenuExpanded: expanding ? _id.toString() : state.currentMenuExpanded
      };
    }

    // First we add a new meal to the menu.guestions
    // After user clicks Save, we call createMeal 
    case ActionTypes.ADD_MEAL: {
      const { menuInfo } = action.payload;
      const { _id, level } = menuInfo;
      const meal: IMeal = {
        ...initialMeal,
        parentMenu: _id,
        level,
        inAdding: true
      }
      return {
        ...state,
        menus: state.menus.map(c => c._id === _id
          ? { ...c, meals: [meal, ...c.meals], inAdding: true }
          : { ...c, inAdding: false }),
        mode: Mode.AddingMeal
      };
    }

    case ActionTypes.VIEW_MEAL: {
      const { meal } = action.payload;
      return {
        ...state,
        menus: state.menus.map(c => c._id === meal.parentMenu
          ? {
            ...c,
            meals: c.meals.map(q => q._id === meal._id ? {
              ...meal,
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
        mode: Mode.ViewingMeal,
        loading: false
      }
    }

    case ActionTypes.SET_MEAL: {
      const { meal } = action.payload;
      const { parentMenu, _id } = meal;
      const inAdding = state.mode === Mode.AddingMeal;

      // for inAdding, _id is Types.ObjectId('000000000000000000000000')
      // thats why we look for q.inAdding instead of q._id === _id
      const menus = state.menus.map(c => c._id === parentMenu
        ? {
          ...c,
          meals: inAdding
            ? c.meals.map(q => q.inAdding ? meal : q)
            : c.meals.map(q => q._id === _id ? meal : q),
          inViewing: false,
          inEditing: false,
          inAdding: false
        }
        : c
      );
      return {
        ...state,
        menus,
        mode: Mode.NULL,
        loading: false
      };
    }


    case ActionTypes.EDIT_MEAL: {
      const { meal } = action.payload;
      return {
        ...state,
        menus: state.menus.map(c => c._id === meal.parentMenu
          ? {
            ...c,
            meals: c.meals.map(q => q._id === meal._id ? {
              ...meal,
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
        mode: Mode.EditingMeal,
        loading: false
      };
    }

    case ActionTypes.DELETE_MEAL: {
      const { meal } = action.payload;
      const { _id, parentMenu } = meal;
      return {
        ...state,
        menus: state.menus.map(c => c._id === parentMenu
          ? {
            ...c,
            meals: c.meals.filter(q => q._id !== _id)
          }
          : c
        ),
        mode: Mode.NULL
      }
    }

    case ActionTypes.CANCEL_MEAL_FORM:
    case ActionTypes.CLOSE_MEAL_FORM: {
      const { meal } = action.payload;
      const menu = state.menus.find(c => c._id === meal.parentMenu)
      let meals: IMeal[] = [];
      switch (state.mode) {
        case Mode.AddingMeal: {
          console.assert(menu!.inAdding, "expected menu.inAdding");
          meals = menu!.meals.filter(q => !q.inAdding)
          break;
        }

        case Mode.ViewingMeal: {
          console.assert(menu!.inViewing, "expected menu.inViewing");
          meals = menu!.meals.map(q => ({ ...q, inViewing: false }))
          break;
        }

        case Mode.EditingMeal: {
          console.assert(menu!.inEditing, "expected menu.inEditing");
          meals = menu!.meals.map(q => ({ ...q, inEditing: false }))
          break;
        }

        default:
          break;
      }

      return {
        ...state,
        menus: state.menus.map(c => c._id === meal.parentMenu
          ? { ...c, meals, inAdding: false, inEditing: false, inViewing: false }
          : c
        ),
        mode: Mode.NULL,
      };
    }

    default:
      return state;  // TODO throw error
  }
};

function markForClean(menus: IMenu[], parentMenu: Types.ObjectId) {
  let deca = menus
    .filter(c => c.parentMenu === parentMenu)
    .map(c => ({ _id: c._id, parentMenu: c.parentMenu }))

  deca.forEach(c => {
    deca = deca.concat(markForClean(menus, c._id!))
  })
  return deca
}
