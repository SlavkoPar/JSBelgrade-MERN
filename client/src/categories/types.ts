import { Types } from 'mongoose';

import { ActionMap, IRecord } from 'global/types';
import { AxiosError } from 'axios';

export const Mode = {
	UNDEFINED: undefined,
	NULL: null,
	AddingCategory: 'AddingCategory',
	ViewingCategory: 'ViewingCategory',
	EditingCategory: 'EditingCategory',
	DeletingCategory: 'DeletingCategory',
	//////////////////////////////////////
	// questions
	AddingQuestion: 'AddingQuestion',
	ViewingQuestion: 'ViewingQuestion',
	EditingQuestion: 'EditingQuestion',
	DeletingQuestion: 'DeletingQuestion',
}

export enum FormMode {
	viewing,
	adding,
	editing
}


export interface IQuestion extends IRecord {
	title: string,
	level: number,
	parentCategory: Types.ObjectId,
	source: number,
	status: number
}

export interface ICategory extends IRecord {
	parentCategory: Types.ObjectId | null,
	title: string,
	level: number,
	questions: IQuestion[],
	numOfQuestions?: number,
	isExpanded?: boolean
}

export interface ICategoryInfo {
	_id: Types.ObjectId,
	level: number
}


export interface IParentInfo {
	parentCategory: Types.ObjectId | null,
	level: number,
	title?: string, // to easier follow getting the list of sub-categories
	inAdding?: boolean
}

export interface ICategoriesState {
	mode: string | null,
	loading: boolean,
	categories: ICategory[],
	currentCategoryExpanded: string,
	lastCategoryExpanded: string | null;
	parentCategories: IParentCategories;
	error?: AxiosError;
}

export interface ICategoriesContext {
	state: ICategoriesState,
	getAllParentCategories: (categoryId: string, questionId: string | null) => Promise<any>;
	getSubCategories: ({ parentCategory, level }: IParentInfo) => void,
	createCategory: (category: ICategory) => void,
	viewCategory: (_id: Types.ObjectId) => void,
	editCategory: (_id: Types.ObjectId) => void,
	updateCategory: (category: ICategory) => void,
	deleteCategory: (_id: Types.ObjectId) => void,
	//////////////
	// questions
	getCategoryQuestions: ({ parentCategory, level, inAdding }: IParentInfo) => void,
	createQuestion: (question: IQuestion) => void,
	viewQuestion: (_id: Types.ObjectId) => void,
	editQuestion: (_id: Types.ObjectId) => void,
	updateQuestion: (question: IQuestion) => void,
	deleteQuestion: (_id: Types.ObjectId) => void
}

export interface ICategoryFormProps {
	inLine: boolean;
	initialValues: ICategory;
	mode: FormMode;
	submitForm: (category: ICategory) => void,
	children: string
}

export interface IQuestionFormProps {
	initialValues: IQuestion;
	mode: FormMode;
	submitForm: (question: IQuestion) => void,
	children: string
}

export interface IParentCategories {
	categoryId: string | null;
	questionId: string | null;
	categoryIds: string[] | null;
}


export enum ActionTypes {
	SET_LOADING = 'SET_LOADING',
	SET_SUB_CATEGORIES = 'SET_SUB_CATEGORIES',
	CLEAN_SUB_TREE = 'CLEAN_SUB_TREE',
	SET_ERROR = 'SET_ERROR',
	ADD_SUB_CATEGORY = 'ADD_SUB_CATEGORY',
	SET_CATEGORY = 'SET_CATEGORY',
	SET_ADDED_CATEGORY = 'SET_ADDED_CATEGORY',
	VIEW_CATEGORY = 'VIEW_CATEGORY',
	EDIT_CATEGORY = 'EDIT_CATEGORY',
	DELETE = 'DELETE',

	CLOSE_CATEGORY_FORM = 'CLOSE_CATEGORY_FORM',
	CANCEL_CATEGORY_FORM = 'CANCEL_CATEGORY_FORM',
	SET_EXPANDED = 'SET_EXPANDED',
	SET_PARENT_CATEGORIES = "SET_PARENT_CATEGORIES",

	// questions
	ADD_QUESTION = 'ADD_QUESTION',
	VIEW_QUESTION = 'VIEW_QUESTION',
	EDIT_QUESTION = 'EDIT_QUESTION',

	SET_QUESTION = 'SET_QUESTION',
	DELETE_QUESTION = 'DELETE_QUESTION',

	CLOSE_QUESTION_FORM = 'CLOSE_QUESTION_FORM',
	CANCEL_QUESTION_FORM = 'CANCEL_QUESTION_FORM'
}

export type CategoriesPayload = {
	[ActionTypes.SET_LOADING]: undefined;

	[ActionTypes.SET_PARENT_CATEGORIES]: {
		parentCategories: IParentCategories
	};

	[ActionTypes.SET_SUB_CATEGORIES]: {
		subCategories: ICategory[];
	};

	[ActionTypes.ADD_SUB_CATEGORY]: IParentInfo;

	[ActionTypes.VIEW_CATEGORY]: {
		category: ICategory;
	};

	[ActionTypes.EDIT_CATEGORY]: {
		category: ICategory;
	};

	[ActionTypes.SET_CATEGORY]: {
		category: ICategory;
	};

	[ActionTypes.SET_ADDED_CATEGORY]: {
		category: ICategory;
	};

	[ActionTypes.DELETE]: {
		_id: Types.ObjectId;
	};

	[ActionTypes.CLEAN_SUB_TREE]: {
		category: ICategory;
	};

	[ActionTypes.CLOSE_CATEGORY_FORM]: undefined;

	[ActionTypes.CANCEL_CATEGORY_FORM]: undefined;

	[ActionTypes.SET_EXPANDED]: {
		_id: Types.ObjectId;
		expanding: boolean;
	}

	[ActionTypes.SET_ERROR]: {
		error: AxiosError;
	};

	/////////////
	// questions

	[ActionTypes.ADD_QUESTION]: {
		categoryInfo: ICategoryInfo;
	}

	[ActionTypes.VIEW_QUESTION]: {
		question: IQuestion;
	};

	[ActionTypes.EDIT_QUESTION]: {
		question: IQuestion;
	};

	[ActionTypes.SET_QUESTION]: {
		question: IQuestion
	};

	[ActionTypes.DELETE_QUESTION]: {
		question: IQuestion;
	};

	[ActionTypes.CLOSE_QUESTION_FORM]: {
		question: IQuestion;
	};

	[ActionTypes.CANCEL_QUESTION_FORM]: {
		question: IQuestion;
	};

};

export type CategoriesActions =
	ActionMap<CategoriesPayload>[keyof ActionMap<CategoriesPayload>];

