import { TxEntry } from "../enums/entry.enum";

export interface ITxBase {
  $tx: IBaseTxBody;
  $sigs: ISigs;
}

interface IBaseTxBody {
  $namespace: string;
  $contract: string;
  $entry: TxEntry;
  $i: {};
  $o?: {};
}

interface ISigs {
  [id: string]: string;
}

export interface IBlankInput {
  [id: string]: {};
}

export interface ICreateTodoTx extends IBaseTxBody {
  $entry: TxEntry.Create;
  $i: ICreateTodoInput;
}

export interface ICreateTodoInput {
  [id: string]: ICreateTodoInputBody;
}

interface ICreateTodoInputBody {
  name: string;
  dueDate: Date;
  body: string;
}

export interface IUpdateTodoTx extends IBaseTxBody {
  $entry: TxEntry.Update;
  $i: IBlankInput;
  $o: IUpdateTodoOutput;
}

export interface IUpdateTodoOutput {
  [id: string]: IUpdateTodoOutputBody;
}

interface IUpdateTodoOutputBody {
  name?: string;
  dueDate?: Date;
  body?: string;
}

export interface IShareTodoTx extends IBaseTxBody {
  $entry: TxEntry.Share;
  $i: IBlankInput;
  $o: IShareTodoOutput;
}

export interface IShareTodoOutput {
  [id: string]: {};
}
