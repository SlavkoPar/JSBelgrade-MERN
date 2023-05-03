// Define the Global State
import { AxiosError } from 'axios';
import { Types } from 'mongoose';
import { IOption } from 'common/types';

export interface IDateAndBy {
	date: Date,
	by: {
		userId: Types.ObjectId,
		userName?: string
	}
}

export interface IRecord {
	wsId: Types.ObjectId,
	_id?: Types.ObjectId,
	created?: IDateAndBy,
	createdBy?: string,
	modified?: IDateAndBy,
	modifiedBy?: string,
	inViewing?: boolean,
	inEditing?: boolean,
	inAdding?: boolean
}

export interface IUser extends IRecord {
	userName: string,
	password?: string,
	email: string,
	color: string,
	level: number,
	parentGroup: Types.ObjectId | null,  // null is allowed because of registerUser, and will be set at Server
	role: ROLES,
	confirmed: boolean
}

export interface IAuthUser {
	wsId: Types.ObjectId, 
	wsName: string,
	userId: Types.ObjectId, // fiktivni _id
	color?: string,
	userName: string,
	password: string,
	email: string,
	role: ROLES,
	registrationConfirmed: boolean, 
	registered?: Date,
	visited?: Date
}

export enum ROLES {
	OWNER = 'OWNER',
	ADMIN = 'ADMIN',
	EDITOR = 'EDITOR',
	VIEWER = 'VIEWER',
}

export interface IGlobalState {
	isAuthenticated: boolean | null;
	everLoggedIn: boolean;
	authUser: IAuthUser;
	canEdit: boolean,
	isDarkMode: boolean;
	variant: string,
	bg: string,
	loading: boolean;
	error?: AxiosError;
	kindOptions: IOption<string>[],
}

export interface IGlobalContext {
	globalState: IGlobalState;
	registerUser: (loginUser: ILoginUser) => Promise<any>;
	signInUser: (loginUser: ILoginUser) => Promise<any>;
  	health: () => void;
}

export enum GlobalActionTypes {
	SET_LOADING = 'SET_LOADING',
	AUTHENTICATE = "AUTHENTICATE",
	UN_AUTHENTICATE = "UN_AUTHENTICATE",
	SET_ERROR = 'SET_ERROR',
    DARK_MODE = "DARK_MODE",
    LIGHT_MODE = "LIGHT_MODE"
}

export interface ILoginUser {
	wsId: Types.ObjectId,
	wsName: string,
	who?: string,
    userName: string;
    email?: string;
    password: string;
	date?: Date;
}


export type ActionMap<M extends Record<string, any>> = {
    [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
    }
    : {
        type: Key;
        payload: M[Key];
    }
};

export type GlobalPayload = {
    [GlobalActionTypes.SET_LOADING]: {
    };

    [GlobalActionTypes.AUTHENTICATE]: {
        user: IUser,
		wsName: string
    };

	[GlobalActionTypes.UN_AUTHENTICATE]: undefined;

    [GlobalActionTypes.SET_ERROR]: {
        error: AxiosError;
    };

    [GlobalActionTypes.LIGHT_MODE]: undefined;

    [GlobalActionTypes.DARK_MODE]: undefined;
};

export type GlobalActions = ActionMap<GlobalPayload>[keyof ActionMap<GlobalPayload>];