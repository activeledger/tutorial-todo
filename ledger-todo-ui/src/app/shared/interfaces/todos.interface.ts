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
