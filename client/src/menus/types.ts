import { Types } from 'mongoose';

import { ActionMap, IRecord } from 'global/types';
import { AxiosError } from 'axios';

export const Mode = {
	UNDEFINED: undefined,
	NULL: null,
	AddingMenu: 'AddingMenu',
	ViewingMenu: 'ViewingMenu',
	EditingMenu: 'EditingMenu',
	DeletingMenu: 'DeletingMenu',
	//////////////////////////////////////
	// meals
	AddingMeal: 'AddingMeal',
	ViewingMeal: 'ViewingMeal',
	EditingMeal: 'EditingMeal',
	DeletingMeal: 'DeletingMeal',
}

export enum FormMode {
	viewing,
	adding,
	editing
}


export interface IMeal extends IRecord {
	title: string,
	level: number,
	parentMenu: Types.ObjectId,
	source: number,
	status: number
}

export interface IMenu extends IRecord {
	parentMenu: Types.ObjectId | null,
	title: string,
	level: number,
	meals: IMeal[],
	numOfMeals?: number,
	isExpanded?: boolean
}

export interface IMenuInfo {
	_id: Types.ObjectId,
	level: number
}


export interface IParentInfo {
	parentMenu: Types.ObjectId | null,
	level: number,
	title?: string, // to easier follow getting the list of sub-menus
	inAdding?: boolean
}

export interface IMenusState {
	mode: string | null,
	loading: boolean,
	menus: IMenu[],
	currentMenuExpanded: string,
	lastMenuExpanded: string | null;
	menuId_mealId_done: string | null;
	parentMenus: IParentMenus;
	error?: AxiosError;
}

export interface IMenusContext {
	state: IMenusState,
	getAllParentMenus: (menuId: string, mealId: string | null) => Promise<any>;
	getSubMenus: ({ parentMenu, level }: IParentInfo) => void,
	createMenu: (menu: IMenu) => void,
	viewMenu: (_id: Types.ObjectId) => void,
	editMenu: (_id: Types.ObjectId) => void,
	updateMenu: (menu: IMenu) => void,
	deleteMenu: (_id: Types.ObjectId) => void,
	//////////////
	// meals
	getMenuMeals: ({ parentMenu, level, inAdding }: IParentInfo) => void,
	createMeal: (meal: IMeal) => void,
	viewMeal: (_id: Types.ObjectId) => void,
	editMeal: (_id: Types.ObjectId) => void,
	updateMeal: (meal: IMeal) => void,
	deleteMeal: (_id: Types.ObjectId) => void
}

export interface IMenuFormProps {
	inLine: boolean;
	initialValues: IMenu;
	mode: FormMode;
	submitForm: (menu: IMenu) => void,
	children: string
}

export interface IMealFormProps {
	initialValues: IMeal;
	mode: FormMode;
	submitForm: (meal: IMeal) => void,
	children: string
}

export interface IParentMenus {
	menuId: string | null;
	mealId: string | null;
	menuIds: string[] | null;
}


export enum ActionTypes {
	SET_LOADING = 'SET_LOADING',
	SET_SUB_MENUS = 'SET_SUB_MENUS',
	CLEAN_SUB_TREE = 'CLEAN_SUB_TREE',
	SET_ERROR = 'SET_ERROR',
	ADD_SUB_MENU = 'ADD_SUB_MENU',
	SET_MENU = 'SET_MENU',
	SET_ADDED_MENU = 'SET_ADDED_MENU',
	VIEW_MENU = 'VIEW_MENU',
	EDIT_MENU = 'EDIT_MENU',
	DELETE = 'DELETE',

	CLOSE_MENU_FORM = 'CLOSE_MENU_FORM',
	CANCEL_MENU_FORM = 'CANCEL_MENU_FORM',
	TOGGLE_EXPANDED = 'TOGGLE_EXPANDED',
	SET_PARENT_MENUS = "SET_PARENT_MENUS",

	// meals
	ADD_MEAL = 'ADD_MEAL',
	VIEW_MEAL = 'VIEW_MEAL',
	EDIT_MEAL = 'EDIT_MEAL',

	SET_MEAL = 'SET_MEAL',
	DELETE_MEAL = 'DELETE_MEAL',

	CLOSE_MEAL_FORM = 'CLOSE_MEAL_FORM',
	CANCEL_MEAL_FORM = 'CANCEL_MEAL_FORM'
}

export type MenusPayload = {
	[ActionTypes.SET_LOADING]: undefined;

	[ActionTypes.SET_PARENT_MENUS]: {
		parentMenus: IParentMenus
	};

	[ActionTypes.SET_SUB_MENUS]: {
		subMenus: IMenu[];
	};

	[ActionTypes.ADD_SUB_MENU]: IParentInfo;

	[ActionTypes.VIEW_MENU]: {
		menu: IMenu;
	};

	[ActionTypes.EDIT_MENU]: {
		menu: IMenu;
	};

	[ActionTypes.SET_MENU]: {
		menu: IMenu;
	};

	[ActionTypes.SET_ADDED_MENU]: {
		menu: IMenu;
	};

	[ActionTypes.DELETE]: {
		_id: Types.ObjectId;
	};

	[ActionTypes.CLEAN_SUB_TREE]: {
		menu: IMenu;
	};

	[ActionTypes.CLOSE_MENU_FORM]: undefined;

	[ActionTypes.CANCEL_MENU_FORM]: undefined;

	[ActionTypes.TOGGLE_EXPANDED]: {
		_id: Types.ObjectId;
		expanding: boolean;
	}

	[ActionTypes.SET_ERROR]: {
		error: AxiosError;
	};

	/////////////
	// meals

	[ActionTypes.ADD_MEAL]: {
		menuInfo: IMenuInfo;
	}

	[ActionTypes.VIEW_MEAL]: {
		meal: IMeal;
	};

	[ActionTypes.EDIT_MEAL]: {
		meal: IMeal;
	};

	[ActionTypes.SET_MEAL]: {
		meal: IMeal
	};

	[ActionTypes.DELETE_MEAL]: {
		meal: IMeal;
	};

	[ActionTypes.CLOSE_MEAL_FORM]: {
		meal: IMeal;
	};

	[ActionTypes.CANCEL_MEAL_FORM]: {
		meal: IMeal;
	};

};

export type MenusActions =
	ActionMap<MenusPayload>[keyof ActionMap<MenusPayload>];

