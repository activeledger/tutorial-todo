export interface ICreateTodo {
  name: string;
  body: string;
  dueDate: Date;
}

export interface IUpdateTodo {
  streamid: string;
  name?: string;
  body?: string;
  dueDate?: Date;
}

export interface ITodo {
  streamid: string;
  name: string;
  body: string;
  dueDate: Date;
  sharedWith: string[];
}

export interface ITodoLedgerResponse {
  owner: string;
  name: string;
  type: string;
  body: string;
  dueDate: string;
  sharedWith: string;
  _id: string;
  _rev: string;
}
