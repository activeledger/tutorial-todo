import { Injectable } from "@angular/core";
import {
  CreateTodoTx,
  UpdateTodoTx,
  ShareTodoTx
} from "../shared/structures/transactions.structure";
import {
  Connection,
  IKey,
  KeyHandler,
  KeyType,
  ILedgerResponse,
  TransactionHandler
} from "@activeledger/sdk";
import { IUpdateTodo, ICreateTodo } from "../shared/interfaces/todos.interface";

@Injectable({
  providedIn: "root"
})
export class LedgerService {
  constructor() {}

  get key(): IKey {
    return JSON.parse(localStorage.getItem("keyPair")) as IKey;
  }

  set key(key: IKey) {
    localStorage.setItem("keyPair", JSON.stringify(key));
  }

  get streamid() {
    return localStorage.getItem("streamid");
  }

  set streamid(streamid: string) {
    localStorage.setItem("streamid", streamid);
  }

  public createIdentity(): Promise<string> {
    return new Promise((resolve, reject) => {
      const conn = new Connection("http", "localhost", 5260);

      const keyHandler = new KeyHandler();
      keyHandler
        .generateKey("local", KeyType.EllipticCurve)
        .then((key: IKey) => {
          this.key = key;
          return keyHandler.onboardKey(key, conn);
        })
        .then((resp: ILedgerResponse) => {
          if (resp.$streams.new && resp.$streams.new[0]) {
            this.streamid = resp.$streams.new[0].id;
            resolve(resp.$streams.new[0].id);
          } else {
            reject("Bad ledger response");
          }
        })
        .catch((err: unknown) => {
          reject(err);
        });
    });
  }

  public createTodo(data: ICreateTodo): Promise<void> {
    return new Promise((resolve, reject) => {
      const conn = new Connection("http", "localhost", 5260);
      const txHandler = new TransactionHandler();

      const transaction = new CreateTodoTx();

      transaction.$tx.$i[this.streamid] = {
        name: data.name,
        body: data.body,
        dueDate: data.dueDate
      };

      txHandler
        .signTransaction(transaction, this.key)
        .then((signedTx: any) => {
          return txHandler.sendTransaction(signedTx, conn);
        })
        .then((ledgerResp: any) => {
          console.log(ledgerResp);
        })
        .catch((err: unknown) => {
          console.error(err);
        });
    });
  }

  public updateTodo(data: IUpdateTodo): Promise<void> {
    return new Promise((resolve, reject) => {
      const conn = new Connection("http", "localhost", 5260);
      const txHandler = new TransactionHandler();

      const transaction = new UpdateTodoTx();

      transaction.$tx.$i[this.streamid] = {};

      transaction.$tx.$o[data.streamid] = {};

      if (data.name) {
        transaction.$tx.$o[data.streamid].name = data.name;
      }

      if (data.body) {
        transaction.$tx.$o[data.streamid].body = data.body;
      }

      if (data.dueDate) {
        transaction.$tx.$o[data.streamid].dueDate = data.dueDate;
      }

      txHandler
        .signTransaction(transaction, this.key)
        .then((signedTx: any) => {
          return txHandler.sendTransaction(signedTx, conn);
        })
        .then((ledgerResp: any) => {
          console.log(ledgerResp);
        })
        .catch((err: unknown) => {
          console.error(err);
        });
    });
  }

  public shareTodo(streamid: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const conn = new Connection("http", "localhost", 5260);
      const txHandler = new TransactionHandler();

      const transaction = new ShareTodoTx();

      transaction.$tx.$i[this.streamid] = {};

      transaction.$tx.$o[streamid] = {};

      txHandler
        .signTransaction(transaction, this.key)
        .then((signedTx: any) => {
          return txHandler.sendTransaction(signedTx, conn);
        })
        .then((ledgerResp: any) => {
          console.log(ledgerResp);
        })
        .catch((err: unknown) => {
          console.error(err);
        });
    });
  }
}
