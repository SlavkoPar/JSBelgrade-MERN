import { useGlobalState } from 'global/GlobalProvider'
import { createContext, useContext, useReducer, useCallback, Dispatch } from 'react';

import { Types } from 'mongoose';
import {
  ActionTypes, IMenu, IMeal, IMenusContext, IParentInfo
} from 'menus/types';
import axios, { AxiosError } from "axios";
import { initialMenusState, MenusReducer } from 'menus/MenusReducer';

const MenusContext = createContext<IMenusContext>({} as any);
const MenuDispatchContext = createContext<Dispatch<any>>(() => null);

type Props = {
  children: React.ReactNode
}

export const MenuProvider: React.FC<Props> = ({ children }) => {

  const globalState = useGlobalState();
  const { wsId } = globalState.authUser;

  const [state, dispatch] = useReducer(MenusReducer, initialMenusState);
  const { parentMenus } = state;
  const { menuIds } = parentMenus!;

  const getAllParentMenus = useCallback(async (menuId: string, mealId: string | null): Promise<any> => {
    try {
      const res = await axios.get(`/api/menus/get-parent-menus/${menuId}`);
      const { status, data } = res;
      if (status === 200) {
        console.log('!!! get-parent-menus', { cId: menuId.toString(), data })
        dispatch({
          type: ActionTypes.SET_PARENT_MENUS, payload: {
            parentMenus: {
              menuId,
              mealId, 
              menuIds: data.map((c: { _id: string, title: string }) => c._id)
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

  const getSubMenus = useCallback(({ parentMenu, level }: IParentInfo) => {
    const url = `/api/menus/${wsId}-${parentMenu}`
    //console.log('FETCHING --->>> getSubMenus', level, parentMenu)
    //dispatch({ type: ActionTypes.SET_LOADING })
    axios
      .get(url)
      .then(({ data }) => {
        const subMenus = data.map((c: IMenu) => ({
          ...c,
          meals: [],
          isExpanded: menuIds ? menuIds.includes(c._id!.toString()) : false
        }))
        dispatch({ type: ActionTypes.SET_SUB_MENUS, payload: { subMenus } });
      })
      .catch((error) => {
        console.log(error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error });
      });
  }, [wsId, menuIds]);

  const createMenu = useCallback((menu: IMenu) => {
    dispatch({ type: ActionTypes.SET_LOADING }) // TODO treba li ovo 
    axios
      .post(`/api/menus/create-menu`, menu)
      .then(({ status, data }) => {
        if (status === 200) {
          console.log('Menu successfully created')
          dispatch({ type: ActionTypes.SET_ADDED_MENU, payload: { menu: { ...data, meals: [] } } });
          dispatch({ type: ActionTypes.CLOSE_MENU_FORM })
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


  const getMenu = (_id: Types.ObjectId,
    type:
      ActionTypes.VIEW_MENU |
      ActionTypes.EDIT_MENU |
      ActionTypes.SET_MENU
  ) => {
    const url = `/api/menus/get-menu/${_id}`
    // dispatch({ type: ActionTypes.SET_LOADING })
    axios
      .get(url)
      .then(({ data: menu }) => {
        dispatch({ type, payload: { menu } });
      })
      .catch((error) => {
        console.log(error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error });
      });
  };

  const viewMenu = useCallback((_id: Types.ObjectId) => {
    getMenu(_id, ActionTypes.VIEW_MENU)
  }, []);

  const editMenu = useCallback((_id: Types.ObjectId) => {
    getMenu(_id, ActionTypes.EDIT_MENU)
  }, []);

  const updateMenu = useCallback((menu: IMenu) => {
    dispatch({ type: ActionTypes.SET_LOADING })
    const url = `/api/menus/update-menu/${menu._id}`
    axios
      .put(url, menu)
      .then(({ status, data: menu }) => {
        if (status === 200) {
          console.log("Menu successfully updated");
          dispatch({ type: ActionTypes.SET_MENU, payload: { menu } });
          dispatch({ type: ActionTypes.CLOSE_MENU_FORM })
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

  const deleteMenu = (_id: Types.ObjectId) => {
    // dispatch({ type: ActionTypes.SET_LOADING })
    axios
      .delete(`/api/menus/delete-menu/${_id}`)
      .then(res => {
        if (res.status === 200) {
          console.log("Menu successfully deleted");
          dispatch({ type: ActionTypes.DELETE, payload: { _id } });
        }
      })
      .catch((error) => {
        console.log(error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error });
      });
  };

  /////////////
  // Meals
  //


  const getMenuMeals = useCallback(({ parentMenu: _id, level }: IParentInfo) => {
    getMenu(_id!, ActionTypes.SET_MENU)
    //(state.mode === Mode.AddingMenu || state.mode === Mode.AddingMeal) 
  }, []);

  
  const createMeal = useCallback((meal: IMeal) => {
    // dispatch({ type: ActionTypes.SET_LOADING })
    axios
      .post(`/api/meals/create-meal`, meal)
      .then(({ status, data }) => {
        if (status === 200) {
          console.log('Meal successfully created')
          dispatch({ type: ActionTypes.SET_MEAL, payload: { meal: data } }); // TODO check setting inViewing, inEditing, inAdding to false
          // TODO setting inAdding: false will close the form
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


  const getMeal = (_id: Types.ObjectId, type: ActionTypes.VIEW_MEAL | ActionTypes.EDIT_MEAL) => {
    const url = `/api/meals/get-meal/${_id}`
    //console.log(`FETCHING --->>> ${url}`)
    // dispatch({ type: ActionTypes.SET_LOADING })
    axios
      .get(url)
      .then(({ data }) => {
        const meal: IMeal = data;
        dispatch({ type, payload: { meal } });
      })
      .catch((error) => {
        console.log(error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error });
      });
  };

  const viewMeal = useCallback((_id: Types.ObjectId) => {
    getMeal(_id, ActionTypes.VIEW_MEAL);
  }, []);

  const editMeal = useCallback((_id: Types.ObjectId) => {
    getMeal(_id, ActionTypes.EDIT_MEAL);
  }, []);

  const updateMeal = useCallback((meal: IMeal) => {
    // no need for re-render, before update
    // dispatch({ type: ActionTypes.SET_LOADING }) 
    const url = `/api/meals/update-meal/${meal._id}`
    axios
      .put(url, meal)
      .then(({ status, data: meal }) => {
        if (status === 200) {
          console.log("Meal successfully updated");
          dispatch({ type: ActionTypes.SET_MEAL, payload: { meal } });
          // dispatch({ type: ActionTypes.CLOSE_MEAL_FORM, payload: { meal } }) 
          // no need for this SET_MEAL will turn of inViewing, inEditing, inAdding for menu and its meals[]
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

  const deleteMeal = (_id: Types.ObjectId) => {
    // dispatch({ type: ActionTypes.SET_LOADING })
    axios
      .delete(`/api/meals/delete-meal/${_id}`)
      .then(res => {
        if (res.status === 200) {
          console.log("Meal successfully deleted");
          dispatch({ type: ActionTypes.DELETE_MEAL, payload: { meal: res.data.meal } });
        }
      })
      .catch((error) => {
        console.log(error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error });
      });
  };

  const contextValue: IMenusContext = {
    state,
    getAllParentMenus,
    getSubMenus, createMenu, viewMenu, editMenu, updateMenu, deleteMenu,
    getMenuMeals, createMeal, viewMeal, editMeal, updateMeal, deleteMeal
  }
  return (
    <MenusContext.Provider value={contextValue}>
      <MenuDispatchContext.Provider value={dispatch}>
        {children}
      </MenuDispatchContext.Provider>
    </MenusContext.Provider>
  );
}

export function useMenuContext() {
  return useContext(MenusContext);
}

export const useMenuDispatch = () => {
  return useContext(MenuDispatchContext)
};
