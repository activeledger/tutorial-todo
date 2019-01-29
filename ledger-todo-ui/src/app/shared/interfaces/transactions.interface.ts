import { TxEntry } from "../enums/entry.enum";

/**
 * Base transaction data
 *
 * @export
 * @interface ITxBase
 */
export interface ITxBase {
  $tx: IBaseTxBody;
  $sigs: ISigs;
}

/**
 * Base transaction body data
 *
 * @interface IBaseTxBody
 */
interface IBaseTxBody {
  $namespace: string;
  $contract: string;
  $entry: TxEntry;
  $i: {};
  $o?: {};
}

/**
 * Transaction signature data
 *
 * @interface ISigs
 */
interface ISigs {
  [id: string]: string;
}

/**
 * When $i is just a stream id with blank object
 *
 * @export
 * @interface IBlankInput
 */
export interface IBlankInput {
  [id: string]: {};
}

/**
 * Base transaction body for creating a todo
 *
 * @export
 * @interface ICreateTodoTx
 * @extends {IBaseTxBody}
 */
export interface ICreateTodoTx extends IBaseTxBody {
  $entry: TxEntry.Create;
  $i: ICreateTodoInput;
}

/**
 * Todo create input body holder
 *
 * @export
 * @interface ICreateTodoInput
 */
export interface ICreateTodoInput {
  [id: string]: ICreateTodoInputBody;
}

/**
 * Todo create input body
 *
 * @interface ICreateTodoInputBody
 */
interface ICreateTodoInputBody {
  name: string;
  dueDate: Date;
  body: string;
}

/**
 * Update todo bast transaction body
 *
 * @export
 * @interface IUpdateTodoTx
 * @extends {IBaseTxBody}
 */
export interface IUpdateTodoTx extends IBaseTxBody {
  $entry: TxEntry.Update;
  $i: IBlankInput;
  $o: IUpdateTodoOutput;
}

/**
 * Update todo transaction output body holder
 *
 * @export
 * @interface IUpdateTodoOutput
 */
export interface IUpdateTodoOutput {
  [id: string]: IUpdateTodoOutputBody;
}

/**
 * Update todo transaction output body
 *
 * @interface IUpdateTodoOutputBody
 */
interface IUpdateTodoOutputBody {
  name?: string;
  dueDate?: Date;
  body?: string;
}

/**
 * Share todo transaction body
 *
 * @export
 * @interface IShareTodoTx
 * @extends {IBaseTxBody}
 */
export interface IShareTodoTx extends IBaseTxBody {
  $entry: TxEntry.Share;
  $i: IBlankInput;
  $o: IShareTodoOutput;
}

/**
 * Share todo output body holder
 *
 * @export
 * @interface IShareTodoOutput
 */
export interface IShareTodoOutput {
  [id: string]: ISharedTodoData;
}

/**
 * Share todo output body
 *
 * @interface ISharedTodoData
 */
interface ISharedTodoData {
  stream: string;
}
