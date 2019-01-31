import {
  ICreateTodoTx,
  ICreateTodoInput,
  IUpdateTodoTx,
  IUpdateTodoOutput
} from "../interfaces/transactions.interface";
import { TxEntry } from "../enums/entry.enum";
import { ITxBase, IBlankInput } from "../interfaces/transactions.interface";
import {
  IShareTodoTx,
  IShareTodoOutput
} from "../interfaces/transactions.interface";

/**
 * Structure used to generate a create todo transaction
 *
 * @export
 * @class CreateTodoTx
 * @implements {ITxBase}
 */
export class CreateTodoTx implements ITxBase {
  $tx = new CreateTodoBody();
  $sigs = {};
}

/**
 * Structure used to generate the body of a create todo transaction
 *
 * @class CreateTodoBody
 * @implements {ICreateTodoTx}
 */
class CreateTodoBody implements ICreateTodoTx {
  $namespace = "todo";
  $contract = "todo";
  $entry: TxEntry.Create = TxEntry.Create;
  $i: ICreateTodoInput = {};
}

/**
 * Structure used to generate an update todo transaction
 *
 * @export
 * @class UpdateTodoTx
 * @implements {ITxBase}
 */
export class UpdateTodoTx implements ITxBase {
  $tx = new UpdateTodoBody();
  $sigs = {};
}

/**
 * Structure used to generate the body of an update todo transaction
 *
 * @class UpdateTodoBody
 * @implements {IUpdateTodoTx}
 */
class UpdateTodoBody implements IUpdateTodoTx {
  $namespace = "todo";
  $contract = "todo";
  $entry: TxEntry.Update = TxEntry.Update;
  $i: IBlankInput = {};
  $o: IUpdateTodoOutput = {};
}

/**
 * Structure used to generate a share todo transaction
 *
 * @export
 * @class ShareTodoTx
 * @implements {ITxBase}
 */
export class ShareTodoTx implements ITxBase {
  $tx = new ShareTodoBody();
  $sigs = {};
}

/**
 * Structure used to generate the body of a share todo transaction
 *
 * @class ShareTodoBody
 * @implements {IShareTodoTx}
 */
class ShareTodoBody implements IShareTodoTx {
  $namespace = "todo";
  $contract = "todo";
  $entry: TxEntry.Share = TxEntry.Share;
  $i: IBlankInput = {};
  $o: IShareTodoOutput = {};
}
