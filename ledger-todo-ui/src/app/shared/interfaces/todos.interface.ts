/**
 * For creating a new todo item
 *
 * @export
 * @interface ICreateTodo
 */
export interface ICreateTodo {
  name: string;
  body: string;
  dueDate: Date;
}

/**
 * For updating a todo item
 *
 * @export
 * @interface IUpdateTodo
 */
export interface IUpdateTodo {
  streamid: string;
  name?: string;
  body?: string;
  dueDate?: Date;
}

/**
 * Data in a todo item
 *
 * @export
 * @interface ITodo
 */
export interface ITodo {
  streamid: string;
  name: string;
  body: string;
  dueDate: Date;
  sharedWith: string[];
  owner?: string;
}
