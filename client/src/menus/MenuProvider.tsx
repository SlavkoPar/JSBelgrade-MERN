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

  const reloadMenuNode = useCallback(async (menuId: string, mealId: string | null): Promise<any> => {
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

  const getSubCats = useCallback(async ({ parentMenu, level }: IParentInfo): Promise<any> => {
    try {
      const url = `/api/menus/${wsId}-${parentMenu}`
      const res = await axios.get(url)
      const { status, data } = res;
      if (status === 200) {
        const subMenus = data.map((c: IMenu) => ({
          ...c,
          meals: [],
          isExpanded: false
        }))
        return subMenus;
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

  
  const createMeal = useCallback(async (meal: IMeal): Promise<any> => {
    try {
      const url = '/api/meals/create-meal'
      const res = await axios.post(url, meal)
      const { status, data } = res;
      if (status === 200) {
        console.log("Meal successfully created");
        // TODO check setting inViewing, inEditing, inAdding to false
        dispatch({ type: ActionTypes.SET_MEAL, payload: { meal: data } });
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

  const updateMeal = useCallback(async (meal: IMeal): Promise<any> => {
    try {
      const url = `/api/meals/update-meal/${meal._id}`
      const res = await axios.put(url, meal)
      const { status, data } = res;
      if (status === 200) {
        // TODO check setting inViewing, inEditing, inAdding to false
        console.log("Meal successfully updated");
        dispatch({ type: ActionTypes.SET_MEAL, payload: { meal: data } });
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
    reloadMenuNode: reloadMenuNode,
    getSubMenus, getSubCats, createMenu, viewMenu, editMenu, updateMenu, deleteMenu,
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

