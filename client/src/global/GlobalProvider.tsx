import React, { createContext, useContext, useReducer, Dispatch, useCallback } from "react";
import { Types } from 'mongoose';
import axios, { AxiosError } from "axios";

import { IUser, IGlobalContext, ILoginUser, ROLES, GlobalActionTypes } from 'global/types'
import { globalReducer, initialGlobalState } from "global/globalReducer";

const GlobalContext = createContext<IGlobalContext>({} as any);
const GlobalDispatchContext = createContext<Dispatch<any>>(() => null);

interface Props {
  children: React.ReactNode
}

export const GlobalProvider: React.FC<Props> = ({ children }) => {
  // If we update globalState, form inner Provider, 
  // we reset changes, and again we use initialGlobalState
  // so, don't use globalDispatch inside of inner Provider, like Categories Provider
  const [globalState, dispatch] = useReducer(globalReducer, initialGlobalState);

  const health = useCallback(() => {
    const url = `api/test`;
    axios
      .post(url)
      .then(({ status }) => {
        if (status === 200) {
          console.log('test successfull:', status)
        }
        else {
          console.log('Status is not 200', status)
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);


  const registerUser = useCallback(async (loginUser: ILoginUser) => {
    const user: IUser = {
      wsId: loginUser.wsId,
      userName: loginUser.userName,
      password: loginUser.password,
      level: 0,
      parentGroup: null,
      role: ROLES.VIEWER,
      email: loginUser.email!,
      color: 'blue',
      confirmed: false,
      created: {
        date: new Date(),
        by: {
          userId: new Types.ObjectId() //globalStore.authUser.userId
        }
      }
    }
    const url = `/api/users/register-user`;
    try {
      const res = await axios.post(url, { ...user, wsName: loginUser.wsName });
      const { status, data } = res;
      if (status === 200) {
        console.log('User successfully registered:', data)
        dispatch({
          type: GlobalActionTypes.AUTHENTICATE, payload: {
            user: data.user,
            wsName: data.wsName
          }
        })
        return data.user;
      }
      else {
        console.log('Status is not 200', status)
        dispatch({
          type: GlobalActionTypes.SET_ERROR, payload: {
            error: new AxiosError('Status is not 200 status: ' + status)
          }
        })
      }
    }
    catch (error) {
      console.log(error);
      dispatch({
        type: GlobalActionTypes.SET_ERROR,
        payload: {
          error: new AxiosError('signIn error') // new AxiosError(error?.response?.data, error)
        }
      });
      return false;
    }
    return null;

  }, [dispatch]);


  const signInUser = useCallback(async (loginUser: ILoginUser): Promise<any> => {
    console.log("signInUser", { loginUser })
    try {
      const res = await axios.post(`/api/users/sign-in-user`, { ...loginUser, date: new Date() });
      const { status, data } = res;
      if (status === 200) {
        console.log('User successfully logged in', data)
        dispatch({ type: GlobalActionTypes.AUTHENTICATE, payload: { user: data, wsName: loginUser.wsName } })
        return true;
      }
      else {
        console.log('Status is not 200', status)
        dispatch({
          type: GlobalActionTypes.SET_ERROR, payload: {
            error: new AxiosError('Status is not 200 status: ' + status)
          }
        })
      }
    }
    catch (error) {
      console.log(error);
      dispatch({
        type: GlobalActionTypes.SET_ERROR,
        payload: {
          error: new AxiosError('signIn error') // new AxiosError(error?.response?.data, error)
        }
      });
      return false;
    }
  }, [dispatch]);


  return (
    <GlobalContext.Provider value={{
      globalState, health: health, registerUser, signInUser
    }}>
      <GlobalDispatchContext.Provider value={dispatch}>
        {children}
      </GlobalDispatchContext.Provider>
    </GlobalContext.Provider>
  );
}

export function useGlobalContext() {
  return useContext(GlobalContext);
}

export const useGlobalDispatch = () => {
  return useContext(GlobalDispatchContext)
};

export const useGlobalState = () => {
  const { globalState } = useGlobalContext()
  return globalState;
}
