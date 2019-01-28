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

export class CreateTodoTx implements ITxBase {
  $tx = new CreateTodoBody();
  $sigs = {};
}

class CreateTodoBody implements ICreateTodoTx {
  $namespace = "todo";
  $contract = "todo";
  $entry: TxEntry.Create = TxEntry.Create;
  $i: ICreateTodoInput = {};
}

export class UpdateTodoTx implements ITxBase {
  $tx = new UpdateTodoBody();
  $sigs = {};
}

class UpdateTodoBody implements IUpdateTodoTx {
  $namespace = "todo";
  $contract = "todo";
  $entry: TxEntry.Update = TxEntry.Update;
  $i: IBlankInput = {};
  $o: IUpdateTodoOutput = {};
}

export class ShareTodoTx implements ITxBase {
  $tx = new ShareTodoBody();
  $sigs = {};
}

class ShareTodoBody implements IShareTodoTx {
  $namespace = "todo";
  $contract = "todo";
  $entry: TxEntry.Share = TxEntry.Share;
  $i: IBlankInput = {};
  $o: IShareTodoOutput = {};
}
