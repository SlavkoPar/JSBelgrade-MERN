import { Types } from 'mongoose';

import { ActionMap, IRecord } from 'global/types';
import { AxiosError } from 'axios';

export const Mode = {
	UNDEFINED: undefined,
	NULL: null,
	AddingTodo: 'AddingTodo',
	ViewingTodo: 'ViewingTodo',
	EditingTodo: 'EditingTodo',
	DeletingTodo: 'DeletingTodo'
}

export enum FormMode {
	viewing,
	adding,
	editing
}


export interface ITodo extends IRecord {
	parentTodo: Types.ObjectId | null,
	title: string
}

export interface ITodoInfo {
	_id: Types.ObjectId,
	level: number
}


export interface IParentInfo {
	level: number,
	title?: string, // to easier follow getting the list of sub-todos
	inAdding?: boolean
}

export interface ITodosState {
	mode: string | null,
	loading: boolean,
	todos: ITodo[],
	currentTodoExpanded: string,
	lastTodoExpanded: string | null;
	error?: AxiosError;
}

export interface ITodosContext {
	state: ITodosState,
	getSubTodos: () => void,
	createTodo: (todo: ITodo) => void,
	viewTodo: (_id: Types.ObjectId) => void,
	editTodo: (_id: Types.ObjectId) => void,
	updateTodo: (todo: ITodo) => void,
	deleteTodo: (_id: Types.ObjectId) => void,
}

export interface ITodoFormProps {
	inLine: boolean;
	todo: ITodo;
	mode: FormMode;
	submitForm: (todo: ITodo) => void,
	children: string
}

export interface IParentTodos {
	todoId: string | null;
	questionId: string | null;
	todoIds: string[] | null;
}


export enum ActionTypes {
	SET_LOADING = 'SET_LOADING',
	SET_SUB_TODOS = 'SET_SUB_TODOS',
	SET_ERROR = 'SET_ERROR',
	ADD_SUB_TODO = 'ADD_SUB_TODO',
	SET_TODO = 'SET_TODO',
	SET_ADDED_TODO = 'SET_ADDED_TODO',
	VIEW_TODO = 'VIEW_TODO',
	EDIT_TODO = 'EDIT_TODO',
	DELETE = 'DELETE',

	CLOSE_TODO_FORM = 'CLOSE_TODO_FORM',
	CANCEL_TODO_FORM = 'CANCEL_TODO_FORM'
}

export type TodosPayload = {
	[ActionTypes.SET_LOADING]: undefined;

	[ActionTypes.SET_SUB_TODOS]: {
		subTodos: ITodo[];
	};

	[ActionTypes.ADD_SUB_TODO]: IParentInfo;

	[ActionTypes.VIEW_TODO]: {
		todo: ITodo;
	};

	[ActionTypes.EDIT_TODO]: {
		todo: ITodo;
	};

	[ActionTypes.SET_TODO]: {
		todo: ITodo;
	};

	[ActionTypes.SET_ADDED_TODO]: {
		todo: ITodo;
	};

	[ActionTypes.DELETE]: {
		_id: Types.ObjectId;
	};
	
	[ActionTypes.CLOSE_TODO_FORM]: undefined;

	[ActionTypes.CANCEL_TODO_FORM]: undefined;

	[ActionTypes.SET_ERROR]: {
		error: AxiosError;
	};

};

export type TodosActions =
	ActionMap<TodosPayload>[keyof ActionMap<TodosPayload>];

