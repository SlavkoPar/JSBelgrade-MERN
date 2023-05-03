import { Types } from 'mongoose';
import { Reducer } from 'react'
import { IGlobalState, GlobalActionTypes, GlobalActions, ROLES, IAuthUser } from "./types";

const initialAuthUser: IAuthUser = {
    wsId: new Types.ObjectId(),
    wsName: '',
    userId: new Types.ObjectId(),
    userName: '',
    password: '',
    email: '',
    color: 'blue',
    role: ROLES.VIEWER,
    registrationConfirmed: false
}

const initGlobalState: IGlobalState = {
    authUser: initialAuthUser,
    isAuthenticated: false,
    everLoggedIn: false,
    canEdit: false,
    isDarkMode: true,
    variant: 'dark',
    bg: 'dark',
    loading: false,
    kindOptions: []
}

let globalStateFromLocalStorage: IGlobalState | undefined;

const hasMissingProps = (): boolean => {
    let b = false;
    const keys = Object.keys(globalStateFromLocalStorage!)
    Object.keys(initGlobalState).forEach((prop: string) => {
        if (!keys.includes(prop)) {
            b = true;
            console.log('missing prop:', prop)
        }
        else if (prop === 'authUser') {
            const keys = Object.keys(globalStateFromLocalStorage!.authUser)
            Object.keys(initGlobalState.authUser).forEach((prop: string) => {
                if (!keys.includes(prop)) {
                    b = true;
                    console.log('missing prop:', prop, ' try with SignOut')
                }
            })
        }
    })
    return b;
}

if ('localStorage' in window) {
    const s = localStorage.getItem('GLOBAL_STATE');
    if (s !== null) {
        globalStateFromLocalStorage = JSON.parse(s);
        if (hasMissingProps()) {
            globalStateFromLocalStorage = undefined;
        }
        else {
            const { authUser } = globalStateFromLocalStorage!;
            authUser.userId = new Types.ObjectId(authUser.userId);
            console.log({ globalStateFromLocalStorage });
        }
    }
}

export const initialGlobalState: IGlobalState = globalStateFromLocalStorage
    ? globalStateFromLocalStorage
    : initGlobalState

export const globalReducer: Reducer<IGlobalState, GlobalActions> = (state, action) => {
    const newState = reducer(state, action);
    const aTypesToStore = [
        GlobalActionTypes.AUTHENTICATE,
        GlobalActionTypes.DARK_MODE,
        GlobalActionTypes.LIGHT_MODE,
        GlobalActionTypes.UN_AUTHENTICATE
    ];
    if (aTypesToStore.includes(action.type)) {
        localStorage.setItem('GLOBAL_STATE', JSON.stringify({
            ...newState,
            isAuthenticated: false,
            error: undefined
        }));
    }
    return newState;
}

const reducer: Reducer<IGlobalState, GlobalActions> = (state, action) => {
    const str = action.type
    switch (action.type) {

        case GlobalActionTypes.SET_LOADING:
            return {
                ...state,
                loading: true
            }

        case GlobalActionTypes.SET_ERROR: {
            const { error } = action.payload;
            return {
                ...state,
                error,
                loading: false
            };
        }

        case GlobalActionTypes.AUTHENTICATE: {
            const { user, wsName } = action.payload;
            return {
                ...state,
                authUser: {
                    wsId: user.wsId,
                    wsName,
                    userId: user._id!,
                    userName: user.userName!,
                    password: user.password!,
                    role: user.role,
                    email: user.email,
                    color: 'blue',
                    registrationConfirmed: user.confirmed,
                    registered: user.created!.date
                    //visited: user.visited!.date
                },
                canEdit: user.role !== ROLES.VIEWER,
                isAuthenticated: true,
                everLoggedIn: true,
                error: undefined
            };
        }

        case GlobalActionTypes.UN_AUTHENTICATE: {
            return {
                ...initGlobalState
            };
        }

        case GlobalActionTypes.LIGHT_MODE:
            return { ...state, isDarkMode: false, variant: 'light', bg: 'light' };

        case GlobalActionTypes.DARK_MODE:
            return { ...state, isDarkMode: true, variant: 'dark', bg: 'dark' };
       
        default: {
            throw Error('Unknown action: ' + str);
        }
    }
};

